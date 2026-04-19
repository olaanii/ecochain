// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title EcoReward
 * @notice The official Ecochain Reward Token (ECO).
 *
 * Hardening notes
 * ---------------
 * - OpenZeppelin AccessControl (v5) replaces Ownable + ad-hoc verifier map:
 *   * DEFAULT_ADMIN_ROLE: manages roles, sets cap, controls timelock path.
 *   * MINTER_ROLE:        may call `mint()` (granted to EcoVerifier).
 *   * PAUSER_ROLE:        may pause/unpause transfers (emergency switch).
 * - Hard supply cap (immutable) prevents any single compromised minter from
 *   running away with unbounded inflation.
 * - Transfers are Pausable for emergency response (e.g. oracle key leak).
 * - Zero-address and zero-amount guards on all privileged ops.
 *
 * Upgradeability is intentionally out-of-scope for this contract; the
 * treasury/verifier is the upgradeable surface. ECO keeps a fixed bytecode
 * to minimise the trust-root surface.
 */
contract EcoReward is ERC20Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Maximum total supply, set once at construction.
    uint256 public immutable cap;

    event CapReached(uint256 cap);

    error ZeroAddress();
    error ZeroAmount();
    error CapExceeded(uint256 attempted, uint256 maximum);

    /**
     * @param admin Initial holder of `DEFAULT_ADMIN_ROLE` + `PAUSER_ROLE`.
     * @param supplyCap Maximum tokens (including decimals) that can ever exist.
     */
    constructor(address admin, uint256 supplyCap)
        ERC20("Ecochain Token", "ECO")
    {
        if (admin == address(0)) revert ZeroAddress();
        if (supplyCap == 0) revert ZeroAmount();
        cap = supplyCap;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * @notice Mint new ECO tokens. Callable only by `MINTER_ROLE`.
     * @param to Recipient. Must be non-zero.
     * @param amount Amount in base units. Must be non-zero. Must not push
     *               total supply above the immutable `cap`.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 newTotal = totalSupply() + amount;
        if (newTotal > cap) revert CapExceeded(newTotal, cap);
        _mint(to, amount);
        if (newTotal == cap) emit CapReached(cap);
    }

    /// @notice Emergency pause of all transfers/mints.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Resume transfers/mints.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // AccessControl + ERC20Pausable both declare supportsInterface — explicit
    // override keeps the compiler happy under OZ v5.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
