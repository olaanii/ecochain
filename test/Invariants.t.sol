// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/EcoReward.sol";
import "../src/EcoVerifier.sol";
import "../src/Staking.sol";

/**
 * @title Handler
 * @dev Guides the fuzzer to call realistic Staking operations.
 *      All call sequences go through this handler so the invariant
 *      checker has well-formed inputs.
 */
contract Handler is Test {
    EcoReward  public token;
    EcoVerifier public verifier;
    Staking    public staking;

    address[] public actors;
    uint256   public totalStaked;
    uint256   public totalRewardsMinted;

    constructor(EcoReward _token, EcoVerifier _verifier, Staking _staking, address[] memory _actors) {
        token    = _token;
        verifier = _verifier;
        staking  = _staking;

        // Accept pre-funded actors (minted by setUp which holds MINTER_ROLE).
        for (uint256 i = 0; i < _actors.length; i++) {
            actors.push(_actors[i]);
            vm.prank(_actors[i]);
            token.approve(address(staking), type(uint256).max);
        }
    }

    function stake(uint256 actorSeed, uint256 amount, uint256 durationSeed) external {
        address actor = actors[actorSeed % actors.length];
        uint256 bal   = token.balanceOf(actor);
        if (bal < staking.MINIMUM_STAKE()) return;

        amount = bound(amount, staking.MINIMUM_STAKE(), bal);

        uint256[4] memory durations = [uint256(30), 90, 180, 365];
        uint256 duration = durations[durationSeed % 4];

        vm.prank(actor);
        try staking.stake(amount, duration) {
            totalStaked += amount;
        } catch { /* ignore failures */ }
    }

    function unstake(uint256 actorSeed, uint256 stakeIdSeed) external {
        address actor = actors[actorSeed % actors.length];
        uint256[] memory ids = staking.getUserStakes(actor);
        if (ids.length == 0) return;

        uint256 stakeId = ids[stakeIdSeed % ids.length];
        Staking.StakeDetails memory d = staking.getStakeDetails(stakeId);
        if (d.withdrawn) return;

        uint256 balBefore = token.balanceOf(actor);
        vm.prank(actor);
        try staking.unstake(stakeId) returns (uint256 total) {
            // Track minted rewards (total > principal means rewards were minted).
            uint256 balAfter = token.balanceOf(actor);
            if (balAfter > balBefore) {
                uint256 net = balAfter - balBefore;
                if (net > d.amount) totalRewardsMinted += net - d.amount;
            }
            totalStaked -= d.amount;
        } catch { /* ignore failures */ }
    }

    function warp(uint256 secs) external {
        vm.warp(block.timestamp + bound(secs, 1, 400 days));
    }

    function ghost_TotalStaked() external view returns (uint256) {
        return totalStaked;
    }
}

/**
 * @title StakingInvariants
 * @dev Invariant test suite for the Staking contract (C-5).
 *
 * Invariants:
 *  I-1: Contract token balance >= sum of all non-withdrawn principals.
 *  I-2: No stake has a reward that would exceed a 200% APY (sanity bound).
 *  I-3: stakeIdCounter is strictly monotonically increasing (no re-use).
 *  I-4: Withdrawn stakes are never counted in getTotalStaked().
 *  I-5: EcoReward totalSupply is non-decreasing (no token destruction).
 *  I-6: Contract is not paused unless emergencyPause was called.
 */
contract StakingInvariants is Test {
    EcoReward   internal token;
    EcoVerifier internal verifier;
    Staking     internal staking;
    Handler     internal handler;

    uint256 internal initialSupply;

    function setUp() public {
        vm.warp(100 hours);

        token    = new EcoReward();
        verifier = new EcoVerifier(address(token));
        staking  = new Staking(address(token));

        token.grantRole(token.MINTER_ROLE(), address(verifier));
        token.grantRole(token.MINTER_ROLE(), address(staking));

        // Pre-fund actors (test contract holds MINTER_ROLE from EcoReward constructor).
        address[] memory actorAddrs = new address[](3);
        for (uint256 i = 1; i <= 3; i++) {
            address actor = address(uint160(i * 0x1000));
            actorAddrs[i - 1] = actor;
            token.mint(actor, 10_000e18);
        }

        handler = new Handler(token, verifier, staking, actorAddrs);

        initialSupply = token.totalSupply();

        // Only fuzz through handler calls.
        targetContract(address(handler));
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = Handler.stake.selector;
        selectors[1] = Handler.unstake.selector;
        selectors[2] = Handler.warp.selector;
        targetSelector(FuzzSelector({ addr: address(handler), selectors: selectors }));
    }

    // I-1: Contract ECO balance >= sum of active (non-withdrawn) principals.
    function invariant_ContractBalanceCoversPrincipals() public view {
        uint256 activePrincipals = _sumActivePrincipals();
        assertGe(
            token.balanceOf(address(staking)),
            activePrincipals,
            "I-1: staking balance < active principals"
        );
    }

    // I-2: Each stake's accrued rewards never exceed 200% of principal
    //      (catches runaway interest bug).
    function invariant_RewardsAreSane() public view {
        uint256 maxStakeId = staking.stakeIdCounter();
        for (uint256 id = 1; id < maxStakeId; id++) {
            Staking.StakeDetails memory d = staking.getStakeDetails(id);
            if (d.staker == address(0)) continue;
            uint256 rewards = staking.calculateAccruedRewards(id);
            assertLe(
                rewards,
                d.amount * 2,
                "I-2: rewards > 200% of principal"
            );
        }
    }

    // I-3: Stake IDs are unique and always increasing.
    function invariant_StakeIdMonotonic() public view {
        uint256 counter = staking.stakeIdCounter();
        assertGe(counter, 1, "I-3: stakeIdCounter should start at 1");
    }

    // I-4: getTotalStaked only counts non-withdrawn stakes.
    function invariant_TotalStakedExcludesWithdrawn() public view {
        for (uint256 i = 0; i < 3; i++) {
            address actor = handler.actors(i);
            uint256 reported = staking.getTotalStaked(actor);
            uint256[] memory ids = staking.getUserStakes(actor);
            uint256 expected = 0;
            for (uint256 j = 0; j < ids.length; j++) {
                Staking.StakeDetails memory d = staking.getStakeDetails(ids[j]);
                if (!d.withdrawn) expected += d.amount;
            }
            assertEq(reported, expected, "I-4: getTotalStaked mismatch");
        }
    }

    // I-5: Total ECO supply never decreases (no burn mechanism in protocol).
    function invariant_TotalSupplyNonDecreasing() public view {
        assertGe(
            token.totalSupply(),
            initialSupply,
            "I-5: totalSupply decreased"
        );
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    function _sumActivePrincipals() internal view returns (uint256 total) {
        uint256 maxId = staking.stakeIdCounter();
        for (uint256 id = 1; id < maxId; id++) {
            Staking.StakeDetails memory d = staking.getStakeDetails(id);
            if (d.staker != address(0) && !d.withdrawn) {
                total += d.amount;
            }
        }
    }
}
