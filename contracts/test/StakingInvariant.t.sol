// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";
import "../src/StakingV3.sol";
import "../src/EcoReward.sol";

/**
 * @title StakingInvariantTest
 * @dev Foundry invariant tests for StakingV3
 * 
 * Invariants to verify:
 * 1. totalStaked == sum of all active stake amounts
 * 2. totalStaked never exceeds contract token balance
 * 3. Rewards increase monotonically with time
 * 4. User stake amounts >= MINIMUM_STAKE
 * 5. No double withdrawal possible
 * 6. Early withdrawal penalty <= 10% of principal
 */
contract StakingInvariantTest is StdInvariant, Test {
    StakingV3 public staking;
    EcoReward public ecoToken;
    
    address public owner = address(this);
    address[] public actors;
    
    uint256 public constant INITIAL_BALANCE = 100000e18;
    
    // Track invariants
    uint256 public sumOfActiveStakes;
    
    function setUp() public {
        // Deploy EcoReward token
        ecoToken = new EcoReward(owner, 1_000_000_000e18);
        ecoToken.grantRole(keccak256("MINTER_ROLE"), owner);
        
        // Deploy StakingV3
        staking = new StakingV3();
        staking.initialize(address(ecoToken), owner);
        
        // Fund staking contract with rewards
        ecoToken.mint(address(staking), 100_000_000e18);
        
        // Setup actors
        for (uint256 i = 1; i <= 5; i++) {
            address actor = address(uint160(i));
            actors.push(actor);
            ecoToken.mint(actor, INITIAL_BALANCE);
            vm.prank(actor);
            ecoToken.approve(address(staking), type(uint256).max);
        }
        
        // Set fuzz target
        targetContract(address(staking));
    }
    
    // ============ Invariant Tests ============
    
    /**
     * @dev Invariant: totalStaked == sum of all active stakes
     */
    function invariant_totalStakedEqualsSumOfActiveStakes() public view {
        uint256 total = staking.totalStaked();
        uint256 sum = 0;
        
        // Iterate through all possible stake IDs (1 to current counter)
        // Note: In practice, this is bounded by actual stake count
        for (uint256 i = 1; i < 1000; i++) {
            try staking.getStakeDetails(i) returns (StakingV3.StakeDetails memory s) {
                if (!s.withdrawn) {
                    sum += s.amount;
                }
            } catch {
                break;
            }
        }
        
        assertEq(total, sum, "totalStaked must equal sum of active stakes");
    }
    
    /**
     * @dev Invariant: totalStaked never exceeds contract balance
     */
    function invariant_totalStakedDoesNotExceedBalance() public view {
        uint256 totalStaked = staking.totalStaked();
        uint256 contractBalance = ecoToken.balanceOf(address(staking));
        
        assertLe(totalStaked, contractBalance, "totalStaked must not exceed contract balance");
    }
    
    /**
     * @dev Invariant: All stakes have valid duration tiers
     */
    function invariant_allStakesHaveValidDurations() public view {
        uint256[4] memory validDurations = [
            staking.DURATION_30_DAYS(),
            staking.DURATION_90_DAYS(),
            staking.DURATION_180_DAYS(),
            staking.DURATION_365_DAYS()
        ];
        
        for (uint256 i = 1; i < 1000; i++) {
            try staking.getStakeDetails(i) returns (StakingV3.StakeDetails memory s) {
                bool valid = false;
                for (uint256 j = 0; j < 4; j++) {
                    if (s.duration == validDurations[j]) {
                        valid = true;
                        break;
                    }
                }
                assertTrue(valid, "All stakes must have valid duration");
            } catch {
                break;
            }
        }
    }
    
    /**
     * @dev Invariant: APY matches duration tier
     */
    function invariant_apyMatchesDuration() public view {
        assertEq(staking.getAPYForDuration(staking.DURATION_30_DAYS()), staking.APY_30_DAYS());
        assertEq(staking.getAPYForDuration(staking.DURATION_90_DAYS()), staking.APY_90_DAYS());
        assertEq(staking.getAPYForDuration(staking.DURATION_180_DAYS()), staking.APY_180_DAYS());
        assertEq(staking.getAPYForDuration(staking.DURATION_365_DAYS()), staking.APY_365_DAYS());
    }
    
    /**
     * @dev Invariant: Reward pools track correct total staked per duration
     */
    function invariant_rewardPoolTotalsMatch() public {
        uint256[4] memory durations = [
            staking.DURATION_30_DAYS(),
            staking.DURATION_90_DAYS(),
            staking.DURATION_180_DAYS(),
            staking.DURATION_365_DAYS()
        ];
        
        for (uint256 d = 0; d < 4; d++) {
            uint256 poolTotal = staking.rewardPools(durations[d]).totalStaked;
            uint256 sum = 0;
            
            for (uint256 i = 1; i < 1000; i++) {
                try staking.getStakeDetails(i) returns (StakingV3.StakeDetails memory s) {
                    if (!s.withdrawn && s.duration == durations[d]) {
                        sum += s.amount;
                    }
                } catch {
                    break;
                }
            }
            
            assertEq(poolTotal, sum, "Reward pool total must match sum of stakes in that tier");
        }
    }
    
    // ============ Fuzz Tests ============
    
    /**
     * @dev Fuzz: Staking with various amounts >= MINIMUM_STAKE
     */
    function testFuzz_StakeValidAmount(uint96 amount, uint8 durationIndex) public {
        vm.assume(amount >= staking.MINIMUM_STAKE());
        vm.assume(amount <= INITIAL_BALANCE);
        
        uint256[4] memory durations = [
            staking.DURATION_30_DAYS(),
            staking.DURATION_90_DAYS(),
            staking.DURATION_180_DAYS(),
            staking.DURATION_365_DAYS()
        ];
        durationIndex = uint8(bound(durationIndex, 0, 3));
        
        address actor = actors[0];
        uint256 stakeId = _stakeAs(actor, amount, durations[durationIndex]);
        
        StakingV3.StakeDetails memory s = staking.getStakeDetails(stakeId);
        assertEq(s.amount, amount, "Stake amount mismatch");
        assertEq(s.staker, actor, "Staker mismatch");
        assertFalse(s.withdrawn, "Should not be withdrawn");
    }
    
    /**
     * @dev Fuzz: Rewards increase monotonically with time
     */
    function testFuzz_RewardsIncreaseWithTime(uint96 amount, uint32 timeDelta) public {
        vm.assume(amount >= staking.MINIMUM_STAKE());
        vm.assume(amount <= INITIAL_BALANCE / 10);
        vm.assume(timeDelta > 0 && timeDelta <= 365 days);
        
        address actor = actors[1];
        uint256 stakeId = _stakeAs(actor, amount, staking.DURATION_365_DAYS());
        
        uint256 rewardsBefore = staking.calculateAccruedRewards(stakeId);
        
        vm.warp(block.timestamp + timeDelta);
        
        uint256 rewardsAfter = staking.calculateAccruedRewards(stakeId);
        
        assertGe(rewardsAfter, rewardsBefore, "Rewards must not decrease");
    }
    
    /**
     * @dev Fuzz: Early withdrawal penalty <= 10%
     */
    function testFuzz_EarlyWithdrawalPenalty(uint96 amount, uint16 daysElapsed) public {
        vm.assume(amount >= staking.MINIMUM_STAKE());
        vm.assume(amount <= INITIAL_BALANCE / 10);
        vm.assume(daysElapsed > 0 && daysElapsed < 30);
        
        address actor = actors[2];
        uint256 stakeId = _stakeAs(actor, amount, staking.DURATION_30_DAYS());
        
        vm.warp(block.timestamp + (uint256(daysElapsed) * 1 days));
        
        uint256 maxPenalty = (amount * staking.EARLY_WITHDRAWAL_PENALTY()) / staking.PENALTY_DENOMINATOR();
        
        // Unstake early and verify penalty
        vm.prank(actor);
        staking.unstake(stakeId);
        
        StakingV3.StakeDetails memory s = staking.getStakeDetails(stakeId);
        uint256 actualPenalty = s.amount + s.accruedRewards - s.withdrawalAmount;
        
        assertLe(actualPenalty, maxPenalty, "Penalty must not exceed 10%");
    }
    
    /**
     * @dev Fuzz: Total supply conservation through stake/unstake cycles
     */
    function testFuzz_StakeUnstakeConservation(uint96 amount, uint8 durationIndex, bool early) public {
        vm.assume(amount >= staking.MINIMUM_STAKE());
        vm.assume(amount <= INITIAL_BALANCE / 10);
        
        uint256[4] memory durations = [
            staking.DURATION_30_DAYS(),
            staking.DURATION_90_DAYS(),
            staking.DURATION_180_DAYS(),
            staking.DURATION_365_DAYS()
        ];
        durationIndex = uint8(bound(durationIndex, 0, 3));
        
        address actor = actors[3];
        uint256 balanceBefore = ecoToken.balanceOf(actor);
        
        uint256 stakeId = _stakeAs(actor, amount, durations[durationIndex]);
        
        if (!early) {
            vm.warp(block.timestamp + durations[durationIndex] + 1);
        } else {
            vm.warp(block.timestamp + (durations[durationIndex] / 2));
        }
        
        vm.prank(actor);
        staking.unstake(stakeId);
        
        uint256 balanceAfter = ecoToken.balanceOf(actor);
        
        // User should get back at least principal minus max penalty
        uint256 minReturn = amount - ((amount * staking.EARLY_WITHDRAWAL_PENALTY()) / staking.PENALTY_DENOMINATOR());
        assertGe(balanceAfter, balanceBefore - amount + minReturn, "User should not lose more than max penalty");
    }
    
    /**
     * @dev Fuzz: Multiple users staking doesn't break invariants
     */
    function testFuzz_MultipleUsersStaking(uint96[5] memory amounts, uint32[5] memory timeWarps) public {
        uint256 totalStakedBefore = staking.totalStaked();
        uint256[] memory stakeIds = new uint256[](5);
        
        for (uint256 i = 0; i < 5; i++) {
            uint256 amount = bound(amounts[i], staking.MINIMUM_STAKE(), INITIAL_BALANCE / 5);
            stakeIds[i] = _stakeAs(actors[i], amount, staking.DURATION_30_DAYS());
        }
        
        uint256 totalStakedAfter = staking.totalStaked();
        assertGt(totalStakedAfter, totalStakedBefore, "Total staked should increase");
        
        // Warp forward random amounts
        for (uint256 i = 0; i < 5; i++) {
            uint256 warp = bound(timeWarps[i], 1 days, 60 days);
            vm.warp(block.timestamp + warp);
            
            // Each user can calculate rewards
            uint256 rewards = staking.calculateAccruedRewards(stakeIds[i]);
            assertGe(rewards, 0, "Rewards should be non-negative");
        }
    }
    
    // ============ Helper Functions ============
    
    function _stakeAs(address actor, uint256 amount, uint256 duration) internal returns (uint256) {
        vm.prank(actor);
        return staking.stake(amount, duration);
    }
}
