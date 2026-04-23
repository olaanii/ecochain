// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title StakingV3
 * @dev MasterChef-style reward accumulator staking contract (gas-optimized)
 * Eliminates O(n) daily compounding loop via global rewardPerTokenStored accumulator
 */
contract StakingV3 is Initializable, ReentrancyGuard, OwnableUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;

    uint256 public constant MINIMUM_STAKE = 100e18;
    uint256 public constant EARLY_WITHDRAWAL_PENALTY = 10;
    uint256 public constant PENALTY_DENOMINATOR = 100;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant BASIS_POINTS = 10000;

    uint256 public constant DURATION_30_DAYS = 30 days;
    uint256 public constant DURATION_90_DAYS = 90 days;
    uint256 public constant DURATION_180_DAYS = 180 days;
    uint256 public constant DURATION_365_DAYS = 365 days;

    uint256 public constant APY_30_DAYS = 500;
    uint256 public constant APY_90_DAYS = 800;
    uint256 public constant APY_180_DAYS = 1200;
    uint256 public constant APY_365_DAYS = 1800;

    IERC20 public ecoToken;
    uint256 private stakeIdCounter;
    uint256 public totalStaked;

    mapping(address => uint256[]) public userStakes;
    mapping(uint256 => StakeDetails) public stakes;
    mapping(uint256 => RewardPool) public rewardPools;

    struct StakeDetails {
        uint256 stakeId;
        address staker;
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint256 endTime;
        uint256 apy;
        uint256 rewardPerTokenPaid;
        uint256 accruedRewards;
        bool withdrawn;
        uint256 withdrawalTime;
        uint256 withdrawalAmount;
    }

    struct RewardPool {
        uint256 totalStaked;
        uint256 rewardPerTokenStored;
        uint256 lastUpdateTime;
        uint256 apy;
    }

    event Staked(uint256 indexed stakeId, address indexed staker, uint256 amount, uint256 duration, uint256 apy, uint256 endTime);
    event Unstaked(uint256 indexed stakeId, address indexed staker, uint256 principal, uint256 rewards, uint256 penalty, uint256 totalAmount, bool earlyWithdrawal);
    event EmergencyPause();
    event EmergencyUnpause();
    event Upgraded(address indexed implementation);

    error InvalidTokenAddress();
    error MinimumStakeNotMet();
    error InvalidDuration();
    error NotStakeOwner();
    error AlreadyWithdrawn();
    error CannotRecoverStakingToken();

    constructor() {
        _disableInitializers();
    }

    function initialize(address _ecoToken, address _owner) public initializer {
        if (_ecoToken == address(0)) revert InvalidTokenAddress();
        __Ownable_init(_owner);
        __Pausable_init();
        ecoToken = IERC20(_ecoToken);
        stakeIdCounter = 1;
        _initializeRewardPool(DURATION_30_DAYS, APY_30_DAYS);
        _initializeRewardPool(DURATION_90_DAYS, APY_90_DAYS);
        _initializeRewardPool(DURATION_180_DAYS, APY_180_DAYS);
        _initializeRewardPool(DURATION_365_DAYS, APY_365_DAYS);
    }

    function _initializeRewardPool(uint256 duration, uint256 apy) internal {
        RewardPool storage pool = rewardPools[duration];
        pool.apy = apy;
        pool.lastUpdateTime = block.timestamp;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        emit Upgraded(newImplementation);
    }

    function _rewardPerToken(uint256 duration) internal view returns (uint256) {
        RewardPool storage pool = rewardPools[duration];
        if (pool.totalStaked == 0) return pool.rewardPerTokenStored;
        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        if (timeElapsed == 0) return pool.rewardPerTokenStored;
        uint256 rewardIncrement = (timeElapsed * pool.apy * PRECISION) / (SECONDS_PER_YEAR * BASIS_POINTS);
        return pool.rewardPerTokenStored + rewardIncrement;
    }

    function _updateRewardPool(uint256 duration) internal {
        RewardPool storage pool = rewardPools[duration];
        pool.rewardPerTokenStored = _rewardPerToken(duration);
        pool.lastUpdateTime = block.timestamp;
    }

    function _calculatePendingRewards(uint256 stakeId) internal view returns (uint256) {
        StakeDetails storage s = stakes[stakeId];
        if (s.withdrawn || s.amount == 0) return 0;
        uint256 currentTime = block.timestamp > s.endTime ? s.endTime : block.timestamp;
        uint256 timeElapsed = currentTime - s.startTime;
        if (timeElapsed == 0) return 0;
        uint256 currentRewardPerToken = s.rewardPerTokenPaid + (timeElapsed * s.apy * PRECISION) / (SECONDS_PER_YEAR * BASIS_POINTS);
        return (s.amount * (currentRewardPerToken - s.rewardPerTokenPaid)) / PRECISION;
    }

    function stake(uint256 amount, uint256 duration) external nonReentrant whenNotPaused returns (uint256 stakeId) {
        if (amount < MINIMUM_STAKE) revert MinimumStakeNotMet();
        if (duration != DURATION_30_DAYS && duration != DURATION_90_DAYS && duration != DURATION_180_DAYS && duration != DURATION_365_DAYS) revert InvalidDuration();

        uint256 apy = rewardPools[duration].apy;
        _updateRewardPool(duration);

        ecoToken.safeTransferFrom(msg.sender, address(this), amount);

        stakeId = stakeIdCounter++;
        uint256 endTime = block.timestamp + duration;
        RewardPool storage pool = rewardPools[duration];

        stakes[stakeId] = StakeDetails({
            stakeId: stakeId,
            staker: msg.sender,
            amount: amount,
            startTime: block.timestamp,
            duration: duration,
            endTime: endTime,
            apy: apy,
            rewardPerTokenPaid: pool.rewardPerTokenStored,
            accruedRewards: 0,
            withdrawn: false,
            withdrawalTime: 0,
            withdrawalAmount: 0
        });

        pool.totalStaked += amount;
        totalStaked += amount;
        userStakes[msg.sender].push(stakeId);

        emit Staked(stakeId, msg.sender, amount, duration, apy, endTime);
    }

    function unstake(uint256 stakeId) external nonReentrant whenNotPaused returns (uint256 totalAmount) {
        StakeDetails storage s = stakes[stakeId];
        if (s.staker != msg.sender) revert NotStakeOwner();
        if (s.withdrawn) revert AlreadyWithdrawn();

        _updateRewardPool(s.duration);
        uint256 rewards = _calculatePendingRewards(stakeId);
        bool early = block.timestamp < s.endTime;
        uint256 penalty = early ? (s.amount * EARLY_WITHDRAWAL_PENALTY) / PENALTY_DENOMINATOR : 0;
        totalAmount = s.amount + rewards - penalty;

        s.withdrawn = true;
        s.withdrawalTime = block.timestamp;
        s.withdrawalAmount = totalAmount;
        s.accruedRewards = rewards;

        RewardPool storage pool = rewardPools[s.duration];
        pool.totalStaked -= s.amount;
        totalStaked -= s.amount;

        ecoToken.safeTransfer(msg.sender, totalAmount);
        emit Unstaked(stakeId, msg.sender, s.amount, rewards, penalty, totalAmount, early);
    }

    function calculateAccruedRewards(uint256 stakeId) public view returns (uint256) {
        StakeDetails storage s = stakes[stakeId];
        if (s.withdrawn) return s.accruedRewards;
        return _calculatePendingRewards(stakeId);
    }

    function getAPYForDuration(uint256 duration) public view returns (uint256) {
        return rewardPools[duration].apy;
    }

    function getUserStakes(address user) external view returns (uint256[] memory) {
        return userStakes[user];
    }

    function getStakeDetails(uint256 stakeId) external view returns (StakeDetails memory) {
        return stakes[stakeId];
    }

    function getTotalStaked(address user) external view returns (uint256 total) {
        uint256[] memory ids = userStakes[user];
        for (uint256 i = 0; i < ids.length; i++) {
            if (!stakes[ids[i]].withdrawn) total += stakes[ids[i]].amount;
        }
    }

    function emergencyPause() external onlyOwner {
        _pause();
        emit EmergencyPause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause();
    }

    function recoverTokens(address token, uint256 amount) external onlyOwner {
        if (token == address(ecoToken)) revert CannotRecoverStakingToken();
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    uint256[50] private __gap;
}
