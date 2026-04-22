// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// UUPS upgradeable imports
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title StakingV2
 * @dev UUPS upgradeable staking contract for ECO tokens with compound interest rewards
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.8, 9.1, 9.3, 10.1, 10.2, 10.3, 10.4, 30.1, 30.6, 30.7
 * 
 * UUPS Migration Notes:
 * - __gap[50] slots reserved for future upgrades
 * - Uses Initializable pattern (constructor replaced by initialize)
 * - Authorization via TimelockController for governance
 */
contract StakingV2 is 
    Initializable, 
    ReentrancyGuard, 
    OwnableUpgradeable, 
    PausableUpgradeable, 
    UUPSUpgradeable 
{
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant MINIMUM_STAKE = 100e18; // 100 ECO (18 decimals)
    uint256 public constant EARLY_WITHDRAWAL_PENALTY = 10; // 10% penalty
    uint256 public constant PENALTY_DENOMINATOR = 100;
    uint256 public constant DAYS_PER_YEAR = 365;
    
    // Duration tiers and their APY rates (in basis points, e.g., 500 = 5%)
    uint256 public constant APY_30_DAYS = 500;   // 5%
    uint256 public constant APY_90_DAYS = 800;   // 8%
    uint256 public constant APY_180_DAYS = 1200; // 12%
    uint256 public constant APY_365_DAYS = 1800; // 18%
    
    // ============ State Variables ============
    
    IERC20 public ecoToken;
    
    // Stake ID counter
    uint256 private stakeIdCounter;
    
    // Mapping of user address to array of stake IDs
    mapping(address => uint256[]) public userStakes;
    
    // Mapping of stake ID to stake details
    mapping(uint256 => StakeDetails) public stakes;
    
    // ============ Structs ============
    
    struct StakeDetails {
        uint256 stakeId;
        address staker;
        uint256 amount;
        uint256 startTime;
        uint256 duration; // in days
        uint256 endTime;
        uint256 apy; // in basis points
        uint256 accruedRewards;
        bool withdrawn;
        uint256 withdrawalTime;
        uint256 withdrawalAmount;
    }
    
    // ============ Events ============
    
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
    
    event RewardsAccrued(
        uint256 indexed stakeId,
        address indexed staker,
        uint256 rewards
    );
    
    event EmergencyPause();
    event EmergencyUnpause();
    event Upgraded(address indexed implementation);
    
    // ============ Errors ============
    
    error InvalidTokenAddress();
    error MinimumStakeNotMet();
    error InvalidDuration();
    error NotStakeOwner();
    error AlreadyWithdrawn();
    error CannotRecoverStakingToken();
    
    // ============ Initializer (replaces constructor) ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initialize the upgradeable staking contract
     * @param _ecoToken Address of the ECO token contract
     * @param _owner Address that will own the contract (typically TimelockController)
     */
    function initialize(address _ecoToken, address _owner) public initializer {
        if (_ecoToken == address(0)) revert InvalidTokenAddress();
        
        __Ownable_init(_owner);
        __Pausable_init();
        
        ecoToken = IERC20(_ecoToken);
        stakeIdCounter = 1;
    }
    
    // ============ UUPS Authorization ============
    
    /**
     * @dev Authorize upgrade - only callable by owner (TimelockController)
     * This ensures upgrades go through the timelock governance process
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        emit Upgraded(newImplementation);
    }
    
    // ============ Staking Functions ============
    
    /**
     * @dev Stake ECO tokens for a specified duration
     * @param amount The amount of ECO to stake (must be >= 100 ECO)
     * @param durationDays The duration in days (30, 90, 180, or 365)
     * 
     * Requirements: 8.1, 8.2, 8.3, 8.4
     */
    function stake(uint256 amount, uint256 durationDays) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 stakeId)
    {
        if (amount < MINIMUM_STAKE) revert MinimumStakeNotMet();
        
        if (
            durationDays != 30 && 
            durationDays != 90 && 
            durationDays != 180 && 
            durationDays != 365
        ) revert InvalidDuration();
        
        uint256 apy = getAPYForDuration(durationDays);
        
        // Transfer tokens from user to contract
        ecoToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Create stake record
        stakeId = stakeIdCounter++;
        uint256 endTime = block.timestamp + (durationDays * 1 days);
        
        StakeDetails storage stakeDetails = stakes[stakeId];
        stakeDetails.stakeId = stakeId;
        stakeDetails.staker = msg.sender;
        stakeDetails.amount = amount;
        stakeDetails.startTime = block.timestamp;
        stakeDetails.duration = durationDays;
        stakeDetails.endTime = endTime;
        stakeDetails.apy = apy;
        stakeDetails.accruedRewards = 0;
        stakeDetails.withdrawn = false;
        
        // Add stake ID to user's stakes
        userStakes[msg.sender].push(stakeId);
        
        emit Staked(stakeId, msg.sender, amount, durationDays, apy, endTime);
        
        return stakeId;
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     * @param stakeId The ID of the stake to unstake
     * 
     * Requirements: 10.1, 10.2, 10.3, 10.4
     */
    function unstake(uint256 stakeId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 totalAmount)
    {
        StakeDetails storage stakeDetails = stakes[stakeId];
        
        if (stakeDetails.staker != msg.sender) revert NotStakeOwner();
        if (stakeDetails.withdrawn) revert AlreadyWithdrawn();
        
        uint256 rewards = calculateAccruedRewards(stakeId);
        bool isEarlyWithdrawal = block.timestamp < stakeDetails.endTime;
        
        uint256 penalty = 0;
        if (isEarlyWithdrawal) {
            penalty = (stakeDetails.amount * EARLY_WITHDRAWAL_PENALTY) / PENALTY_DENOMINATOR;
        }
        
        totalAmount = stakeDetails.amount + rewards - penalty;
        
        stakeDetails.withdrawn = true;
        stakeDetails.withdrawalTime = block.timestamp;
        stakeDetails.withdrawalAmount = totalAmount;
        stakeDetails.accruedRewards = rewards;
        
        ecoToken.safeTransfer(msg.sender, totalAmount);
        
        emit Unstaked(
            stakeId,
            msg.sender,
            stakeDetails.amount,
            rewards,
            penalty,
            totalAmount,
            isEarlyWithdrawal
        );
        
        return totalAmount;
    }
    
    // ============ Reward Calculation Functions ============
    
    /**
     * @dev Calculate accrued rewards using compound interest formula
     * Formula: principal × (1 + apy/365)^days - principal
     * 
     * Requirements: 8.6, 8.8, 9.1, 9.3
     */
    function calculateAccruedRewards(uint256 stakeId) 
        public 
        view 
        returns (uint256)
    {
        StakeDetails storage stakeDetails = stakes[stakeId];
        
        if (stakeDetails.withdrawn) {
            return stakeDetails.accruedRewards;
        }
        
        uint256 currentTime = block.timestamp;
        if (currentTime > stakeDetails.endTime) {
            currentTime = stakeDetails.endTime;
        }
        
        uint256 elapsedSeconds = currentTime - stakeDetails.startTime;
        uint256 elapsedDays = elapsedSeconds / 1 days;
        
        if (elapsedDays == 0) {
            return 0;
        }
        
        uint256 principal = stakeDetails.amount;
        uint256 apy = stakeDetails.apy;
        
        uint256 rate = (1e18 * (DAYS_PER_YEAR * 1e18 + apy * 1e16)) / (DAYS_PER_YEAR * 1e18);
        
        uint256 compounded = 1e18;
        for (uint256 i = 0; i < elapsedDays; i++) {
            compounded = (compounded * rate) / 1e18;
            if (compounded > 1e36) break;
        }
        
        uint256 finalAmount = (principal * compounded) / 1e18;
        
        if (finalAmount > principal) {
            return finalAmount - principal;
        }
        
        return 0;
    }
    
    /**
     * @dev Get APY for a given duration
     */
    function getAPYForDuration(uint256 durationDays) 
        public 
        pure 
        returns (uint256)
    {
        if (durationDays == 30) return APY_30_DAYS;
        if (durationDays == 90) return APY_90_DAYS;
        if (durationDays == 180) return APY_180_DAYS;
        if (durationDays == 365) return APY_365_DAYS;
        
        revert InvalidDuration();
    }
    
    // ============ Query Functions ============
    
    function getUserStakes(address user) 
        external 
        view 
        returns (uint256[] memory)
    {
        return userStakes[user];
    }
    
    function getStakeDetails(uint256 stakeId) 
        external 
        view 
        returns (StakeDetails memory)
    {
        return stakes[stakeId];
    }
    
    function getAccruedRewards(uint256 stakeId) 
        external 
        view 
        returns (uint256)
    {
        return calculateAccruedRewards(stakeId);
    }
    
    function getTotalStaked(address user) 
        external 
        view 
        returns (uint256 total)
    {
        uint256[] memory userStakeIds = userStakes[user];
        for (uint256 i = 0; i < userStakeIds.length; i++) {
            if (!stakes[userStakeIds[i]].withdrawn) {
                total += stakes[userStakeIds[i]].amount;
            }
        }
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Emergency pause function
     * Requirements: 30.6, 30.7
     */
    function emergencyPause() external onlyOwner {
        _pause();
        emit EmergencyPause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause();
    }
    
    /**
     * @dev Recover tokens sent to contract by mistake
     * Cannot recover the staking token (ECO)
     */
    function recoverTokens(address token, uint256 amount)
        external
        onlyOwner
    {
        if (token == address(ecoToken)) revert CannotRecoverStakingToken();
        IERC20(token).safeTransfer(msg.sender, amount);
    }
    
    // ============ Upgrade Gap ============
    
    /**
     * @dev Reserved storage slots for future upgrades
     * This ensures storage layout compatibility across upgrades
     * 50 slots = 50 * 32 bytes = 1600 bytes reserved
     */
    uint256[50] private __gap;
}
