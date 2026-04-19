import { useState, useCallback, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useThrottle } from "@/hooks/use-throttle";

interface RateLimitedFormOptions {
  debounceMs?: number;
  throttleMs?: number;
  maxSubmissionsPerMinute?: number;
  cooldownMs?: number;
}

interface RateLimitedFormProps {
  children: (props: {
    isRateLimited: boolean;
    remainingCooldown: number;
    submissionCount: number;
    handleSubmit: (e: React.FormEvent) => void;
    canSubmit: boolean;
  }) => React.ReactNode;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  options?: RateLimitedFormOptions;
}

export function RateLimitedForm({
  children,
  onSubmit,
  options = {},
}: RateLimitedFormProps) {
  const {
    debounceMs = 500,
    throttleMs = 1000,
    maxSubmissionsPerMinute = 5,
    cooldownMs = 2000,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const submissionTimestamps = useRef<number[]>([]);

  const canSubmit = !isSubmitting && remainingCooldown === 0;

  // Debounced submit handler
  const debouncedSubmit = useDebounce(
    useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check rate limit
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        submissionTimestamps.current = submissionTimestamps.current.filter(
          (ts) => ts > oneMinuteAgo
        );

        if (submissionTimestamps.current.length >= maxSubmissionsPerMinute) {
          console.warn("Rate limit exceeded: Too many submissions");
          return;
        }

        setIsSubmitting(true);
        submissionTimestamps.current.push(now);
        setSubmissionCount(submissionTimestamps.current.length);

        try {
          await onSubmit(e);
        } finally {
          setIsSubmitting(false);
          
          // Set cooldown
          if (cooldownMs > 0) {
            setRemainingCooldown(cooldownMs);
            const interval = setInterval(() => {
              setRemainingCooldown((prev) => {
                if (prev <= 100) {
                  clearInterval(interval);
                  return 0;
                }
                return prev - 100;
              });
            }, 100);
          }
        }
      },
      [onSubmit, maxSubmissionsPerMinute, cooldownMs]
    ),
    debounceMs
  );

  // Throttled submit handler for rapid clicks
  const throttledSubmit = useThrottle(debouncedSubmit, throttleMs);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      if (!canSubmit) return;
      throttledSubmit(e);
    },
    [canSubmit, throttledSubmit]
  );

  return (
    <form onSubmit={handleSubmit}>
      {children({
        isRateLimited: !canSubmit,
        remainingCooldown,
        submissionCount,
        handleSubmit,
        canSubmit,
      })}
    </form>
  );
}

interface RateLimitedButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  cooldownMs?: number;
  throttleMs?: number;
  disabled?: boolean;
  className?: string;
}

export function RateLimitedButton({
  children,
  onClick,
  cooldownMs = 2000,
  throttleMs = 500,
  disabled = false,
  className,
}: RateLimitedButtonProps) {
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const canClick = !isLoading && remainingCooldown === 0 && !disabled;

  const handleClick = useThrottle(
    useCallback(async () => {
      if (!canClick || !onClick) return;

      setIsLoading(true);

      try {
        await onClick();
      } finally {
        setIsLoading(false);
        
        // Set cooldown
        if (cooldownMs > 0) {
          setRemainingCooldown(cooldownMs);
          const interval = setInterval(() => {
            setRemainingCooldown((prev) => {
              if (prev <= 100) {
                clearInterval(interval);
                return 0;
              }
              return prev - 100;
            });
          }, 100);
        }
      }
    }, [canClick, onClick, cooldownMs]),
    throttleMs
  );

  const formatCooldown = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canClick}
      className={className}
    >
      {isLoading ? (
        <span>Loading...</span>
      ) : remainingCooldown > 0 ? (
        <span>Wait {formatCooldown(remainingCooldown)}</span>
      ) : (
        children
      )}
    </button>
  );
}
