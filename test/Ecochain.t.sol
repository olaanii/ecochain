// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/EcoReward.sol";
import "../src/EcoVerifier.sol";

contract EcochainTest is Test {
    EcoReward public ecoToken;
    EcoVerifier public verifier;
    address public user = address(0x123);
    address public owner = address(0x456);

    function setUp() public {
        vm.warp(100 hours); // Ensure block.timestamp is large enough for subtractions
        vm.startPrank(owner);
        ecoToken = new EcoReward();
        verifier = new EcoVerifier(address(ecoToken));
        // Grant MINTER_ROLE to the verifier so it can mint ECO on proof submission.
        ecoToken.grantRole(ecoToken.MINTER_ROLE(), address(verifier));
        
        verifier.setTask("test_task", 10 * 10**18);
        vm.stopPrank();
    }

    function test_SubmitProof() public {
        vm.startPrank(user);
        
        uint256 startTime = block.timestamp;
        string memory taskId = "test_task";
        string memory proofHash = "some_unique_hash";
        
        verifier.submitProof(taskId, proofHash, startTime);
        
        assertEq(ecoToken.balanceOf(user), 10 * 10**18);
        vm.stopPrank();
    }

    function test_ExpiredProof() public {
        vm.startPrank(user);
        
        uint256 oldTime = block.timestamp - 49 hours;
        string memory taskId = "test_task";
        string memory proofHash = "old_hash";
        
        vm.expectRevert("EcoVerifier: Proof expired (>48h)");
        verifier.submitProof(taskId, proofHash, oldTime);
        
        vm.stopPrank();
    }

    function test_DuplicateProof() public {
        vm.startPrank(user);
        
        string memory taskId = "test_task";
        string memory proofHash = "unique_hash";
        
        verifier.submitProof(taskId, proofHash, block.timestamp);
        
        vm.expectRevert("EcoVerifier: Proof already used");
        verifier.submitProof(taskId, proofHash, block.timestamp);
        
        vm.stopPrank();
    }
}
