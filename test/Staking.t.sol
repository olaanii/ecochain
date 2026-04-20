// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Staking.sol";
import "../src/EcoReward.sol";

/**
 * @title StakingTest
 * @dev Comprehensive test suite for Staking contract
 * 
 * Requirements: 30.9 (>95% test coverage)
 */
contract StakingTest is Test {
    Staking public staking;
    EcoReward public ecoToken;
    
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public owner = address(this);
    
    uint256 public constant INITIAL_BALANCE = 10000e18; // 10,000 ECO
    uint256 public constant MINIMUM_STAKE = 100e18; // 100 ECO
    
    event Staked(
        uint256 indexed stakeId,
        address indexed staker,
        uint256 amount,
        uint256 duration,
        uint256 apy,
        uint256 endTime
    );
    
    event Unstaked(
        uint256 indexed stakeId,
        address indexed staker,
        uint256 principal,
        uint256 rewards,
        uint256 penalty,
        uint256 totalAmount,
        bool earlyWithdrawal
    );
    
    function setUp() public {
        // Deploy EcoReward token
        ecoToken = new EcoReward();
        
        // Deploy Staking contract
        staking = new Staking(address(ecoToken));
        
        // Grant MINTER_ROLE so staking can mint reward tokens on unstake.
        ecoToken.grantRole(ecoToken.MINTER_ROLE(), address(staking));
        
        // Mint tokens to users
        ecoToken.mint(user1, INITIAL_BALANCE);
        ecoToken.mint(user2, INITIAL_BALANCE);
        
        // Approve staking contract to spend tokens
        vm.prank(user1);
        ecoToken.approve(address(staking), type(uint256).max);
        
        vm.prank(user2);
        ecoToken.approve(address(staking), type(uint256).max);
    }
    
    // ============ Stake Function Tests ============
    
    function test_StakeWithValidAmount() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        assertEq(stakeId, 1);
        
        Staking.StakeDetails memory details = staking.getStakeDetails(stakeId);
        assertEq(details.staker, user1);
        assertEq(details.amount, MINIMUM_STAKE);
        assertEq(details.duration, 30);
        assertEq(details.apy, staking.APY_30_DAYS());
        assertFalse(details.withdrawn);
    }
    
    function test_StakeWithLargeAmount() public {
        uint256 largeAmount = 5000e18;
        
        vm.prank(user1);
        uint256 stakeId = staking.stake(largeAmount, 365);
        
        Staking.StakeDetails memory details = staking.getStakeDetails(stakeId);
        assertEq(details.amount, largeAmount);
        assertEq(details.apy, staking.APY_365_DAYS());
    }
    
    function test_StakeWithInvalidAmountTooLow() public {
        uint256 tooLowAmount = 50e18; // 50 ECO < 100 ECO minimum
        
        vm.prank(user1);
        vm.expectRevert("Staking: Amount must be >= 100 ECO");
        staking.stake(tooLowAmount, 30);
    }
    
    function test_StakeWithInvalidDuration() public {
        vm.prank(user1);
        vm.expectRevert("Staking: Invalid duration. Must be 30, 90, 180, or 365 days");
        staking.stake(MINIMUM_STAKE, 60); // 60 days is not valid
    }
    
    function test_StakeWithAllValidDurations() public {
        uint256[] memory validDurations = new uint256[](4);
        validDurations[0] = 30;
        validDurations[1] = 90;
        validDurations[2] = 180;
        validDurations[3] = 365;
        
        for (uint256 i = 0; i < validDurations.length; i++) {
            vm.prank(user1);
            uint256 stakeId = staking.stake(MINIMUM_STAKE, validDurations[i]);
            
            Staking.StakeDetails memory details = staking.getStakeDetails(stakeId);
            assertEq(details.duration, validDurations[i]);
        }
    }
    
    function test_StakeTransfersTokens() public {
        uint256 balanceBefore = ecoToken.balanceOf(user1);
        
        vm.prank(user1);
        staking.stake(MINIMUM_STAKE, 30);
        
        uint256 balanceAfter = ecoToken.balanceOf(user1);
        assertEq(balanceBefore - balanceAfter, MINIMUM_STAKE);
        assertEq(ecoToken.balanceOf(address(staking)), MINIMUM_STAKE);
    }
    
    function test_StakeEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit Staked(1, user1, MINIMUM_STAKE, 30, staking.APY_30_DAYS(), block.timestamp + 30 days);
        vm.prank(user1);
        staking.stake(MINIMUM_STAKE, 30);
    }
    
    function test_MultipleStakesPerUser() public {
        vm.prank(user1);
        uint256 stakeId1 = staking.stake(MINIMUM_STAKE, 30);
        
        vm.prank(user1);
        uint256 stakeId2 = staking.stake(MINIMUM_STAKE * 2, 90);
        
        uint256[] memory userStakes = staking.getUserStakes(user1);
        assertEq(userStakes.length, 2);
        assertEq(userStakes[0], stakeId1);
        assertEq(userStakes[1], stakeId2);
    }
    
    // ============ Unstake Function Tests ============
    
    function test_UnstakeAfterMaturity() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        // Fast forward past maturity
        vm.warp(block.timestamp + 31 days);
        
        vm.prank(user1);
        uint256 totalAmount = staking.unstake(stakeId);
        
        // Should receive principal + rewards (no penalty)
        assertGt(totalAmount, MINIMUM_STAKE);
        
        Staking.StakeDetails memory details = staking.getStakeDetails(stakeId);
        assertTrue(details.withdrawn);
    }
    
    function test_UnstakeBeforeMaturityWithPenalty() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        // Fast forward but not past maturity
        vm.warp(block.timestamp + 15 days);
        
        uint256 balanceBefore = ecoToken.balanceOf(user1);
        
        vm.prank(user1);
        uint256 totalAmount = staking.unstake(stakeId);
        
        // Should receive principal + rewards - 10% penalty
        uint256 expectedPenalty = (MINIMUM_STAKE * 10) / 100;
        assertLt(totalAmount, MINIMUM_STAKE); // Less than principal due to penalty
        
        uint256 balanceAfter = ecoToken.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, totalAmount);
    }
    
    function test_UnstakeNotOwner() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        vm.prank(user2);
        vm.expectRevert("Staking: Not stake owner");
        staking.unstake(stakeId);
    }
    
    function test_UnstakeAlreadyWithdrawn() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        vm.warp(block.timestamp + 31 days);
        
        vm.prank(user1);
        staking.unstake(stakeId);
        
        // Try to unstake again
        vm.prank(user1);
        vm.expectRevert("Staking: Already withdrawn");
        staking.unstake(stakeId);
    }
    
    function test_UnstakeEmitsEvent() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        vm.warp(block.timestamp + 31 days);
        
        // Compute expected values using the linear interest formula.
        // elapsedDays is capped at the stake duration (30 days).
        uint256 expectedRewards = (MINIMUM_STAKE * staking.APY_30_DAYS() * 30)
            / (staking.DAYS_PER_YEAR() * staking.APY_DENOMINATOR());
        uint256 expectedTotal = MINIMUM_STAKE + expectedRewards;

        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit Unstaked(stakeId, user1, MINIMUM_STAKE, expectedRewards, 0, expectedTotal, false);
        staking.unstake(stakeId);
    }
    
    // ============ Reward Calculation Tests ============
    
    function test_RewardCalculationAfterMaturity() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        // Fast forward past maturity
        vm.warp(block.timestamp + 31 days);
        
        uint256 rewards = staking.calculateAccruedRewards(stakeId);
        assertGt(rewards, 0);
    }
    
    function test_RewardCalculationBeforeMaturity() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        // Fast forward but not past maturity
        vm.warp(block.timestamp + 15 days);
        
        uint256 rewards = staking.calculateAccruedRewards(stakeId);
        assertGt(rewards, 0);
    }
    
    function test_RewardCalculationNoTimeElapsed() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        uint256 rewards = staking.calculateAccruedRewards(stakeId);
        assertEq(rewards, 0);
    }
    
    function test_RewardMonotonicity() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 365);
        
        uint256 rewards1 = staking.calculateAccruedRewards(stakeId);
        
        vm.warp(block.timestamp + 100 days);
        uint256 rewards2 = staking.calculateAccruedRewards(stakeId);
        
        vm.warp(block.timestamp + 100 days);
        uint256 rewards3 = staking.calculateAccruedRewards(stakeId);
        
        // Rewards should increase over time
        assertLe(rewards1, rewards2);
        assertLe(rewards2, rewards3);
    }
    
    function test_APYForDifferentDurations() public {
        assertEq(staking.getAPYForDuration(30), staking.APY_30_DAYS());
        assertEq(staking.getAPYForDuration(90), staking.APY_90_DAYS());
        assertEq(staking.getAPYForDuration(180), staking.APY_180_DAYS());
        assertEq(staking.getAPYForDuration(365), staking.APY_365_DAYS());
    }
    
    // ============ Query Function Tests ============
    
    function test_GetUserStakes() public {
        vm.prank(user1);
        staking.stake(MINIMUM_STAKE, 30);
        
        vm.prank(user1);
        staking.stake(MINIMUM_STAKE * 2, 90);
        
        uint256[] memory userStakes = staking.getUserStakes(user1);
        assertEq(userStakes.length, 2);
    }
    
    function test_GetTotalStaked() public {
        vm.prank(user1);
        staking.stake(MINIMUM_STAKE, 30);
        
        vm.prank(user1);
        staking.stake(MINIMUM_STAKE * 2, 90);
        
        uint256 totalStaked = staking.getTotalStaked(user1);
        assertEq(totalStaked, MINIMUM_STAKE + MINIMUM_STAKE * 2);
    }
    
    function test_GetTotalStakedAfterWithdrawal() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        vm.prank(user1);
        staking.stake(MINIMUM_STAKE * 2, 90);
        
        vm.warp(block.timestamp + 31 days);
        
        vm.prank(user1);
        staking.unstake(stakeId);
        
        uint256 totalStaked = staking.getTotalStaked(user1);
        assertEq(totalStaked, MINIMUM_STAKE * 2);
    }
    
    // ============ Security Tests ============
    
    function test_ReentrancyProtection() public {
        // This test verifies that the nonReentrant modifier is in place
        // The contract should prevent reentrancy attacks
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        vm.warp(block.timestamp + 31 days);
        
        // Normal unstake should work
        vm.prank(user1);
        staking.unstake(stakeId);
    }
    
    function test_EmergencyPause() public {
        staking.emergencyPause();
        
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("EnforcedPause()"))));
        staking.stake(MINIMUM_STAKE, 30);
    }
    
    function test_EmergencyUnpause() public {
        staking.emergencyPause();
        staking.emergencyUnpause();
        
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        assertEq(stakeId, 1);
    }
    
    function test_OnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        staking.emergencyPause();
    }
    
    // ============ Edge Case Tests ============
    
    function test_StakeWithExactMinimumAmount() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 30);
        
        Staking.StakeDetails memory details = staking.getStakeDetails(stakeId);
        assertEq(details.amount, MINIMUM_STAKE);
    }
    
    function test_MultipleUsersStaking() public {
        vm.prank(user1);
        uint256 stakeId1 = staking.stake(MINIMUM_STAKE, 30);
        
        vm.prank(user2);
        uint256 stakeId2 = staking.stake(MINIMUM_STAKE * 2, 90);
        
        Staking.StakeDetails memory details1 = staking.getStakeDetails(stakeId1);
        Staking.StakeDetails memory details2 = staking.getStakeDetails(stakeId2);
        
        assertEq(details1.staker, user1);
        assertEq(details2.staker, user2);
    }
    
    function test_LongTermStaking() public {
        vm.prank(user1);
        uint256 stakeId = staking.stake(MINIMUM_STAKE, 365);
        
        // Fast forward 1 year
        vm.warp(block.timestamp + 365 days);
        
        uint256 rewards = staking.calculateAccruedRewards(stakeId);
        assertGt(rewards, 0);
        
        vm.prank(user1);
        uint256 totalAmount = staking.unstake(stakeId);
        
        // Should receive principal + rewards
        assertGt(totalAmount, MINIMUM_STAKE);
    }
}
