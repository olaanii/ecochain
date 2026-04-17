// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EcoReward
 * @dev The official Ecochain Reward Token (ECO).
 * Minting is restricted to authorized verifiers or the owner.
 */
contract EcoReward is ERC20, Ownable {
    mapping(address => bool) public isVerifier;

    event VerifierSet(address indexed verifier, bool authorized);

    constructor() ERC20("Ecochain Token", "ECO") Ownable(msg.sender) {
        // Initial setup can be done here if needed.
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner() || isVerifier[msg.sender], "EcoReward: Not authorized");
        _;
    }

    /**
     * @dev Sets the verification status of an address.
     * @param verifier The address to authorize/revoke.
     * @param authorized True to authorize, false to revoke.
     */
    function setVerifier(address verifier, bool authorized) external onlyOwner {
        isVerifier[verifier] = authorized;
        emit VerifierSet(verifier, authorized);
    }

    /**
     * @dev Mint new ECO tokens.
     * @param to The address receiving the tokens.
     * @param amount The amount of ECO (in wei units) to mint.
     */
    function mint(address to, uint256 amount) external onlyAuthorized {
        _mint(to, amount);
    }
}
