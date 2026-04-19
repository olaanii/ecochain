#!/usr/bin/env python3
"""Drive `weave init` with default choices (TTY required for bubbletea)."""
import os
import pty
import select
import subprocess
import sys
import termios
import tty

# Default: accept "Generate new account" and confirm through early prompts.
INPUT_SEQUENCE = b"\r" * 8 + b"y\r" * 4 + b"\r" * 12


def main() -> int:
    env = os.environ.copy()
    env.setdefault("PATH", "")
    env["PATH"] = (
        f"{os.path.expanduser('~')}/.local/bin:"
        f"{os.path.expanduser('~')}/go/bin:"
        f"{os.path.expanduser('~')}/.local/go-1.23.4/bin:"
        + env["PATH"]
    )

    master_fd, slave_fd = pty.openpty()
    try:
        old = termios.tcgetattr(sys.stdin)
        tty.setcbreak(sys.stdin.fileno())
    except termios.error:
        old = None

    try:
        p = subprocess.Popen(
            ["weave", "init"],
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            env=env,
            cwd=os.path.expanduser("~"),
        )
        os.close(slave_fd)
        slave_fd = -1

        buf = bytearray()
        pos = 0
        while True:
            if p.poll() is not None and not select.select([master_fd], [], [], 0)[0]:
                break
            r, _, _ = select.select([master_fd, sys.stdin], [], [], 0.3)
            if master_fd in r:
                chunk = os.read(master_fd, 4096)
                if not chunk:
                    break
                sys.stdout.buffer.write(chunk)
                sys.stdout.buffer.flush()
                buf.extend(chunk)
                if pos < len(INPUT_SEQUENCE):
                    # Send a keystroke shortly after prompts appear.
                    if b"?" in chunk or b"Welcome" in buf or len(buf) > 200:
                        os.write(master_fd, INPUT_SEQUENCE[pos : pos + 1])
                        pos += 1
            if sys.stdin in r:
                data = os.read(sys.stdin.fileno(), 4096)
                if not data:
                    break
                os.write(master_fd, data)
        return p.wait()
    finally:
        if old is not None:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old)
        if slave_fd >= 0:
            os.close(slave_fd)
        try:
            os.close(master_fd)
        except OSError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
