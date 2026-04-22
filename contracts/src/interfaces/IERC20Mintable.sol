// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IERC20Mintable
 * @dev Interface for ECO token with minting capability
 */
interface IERC20Mintable {
    function mint(address to, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}
