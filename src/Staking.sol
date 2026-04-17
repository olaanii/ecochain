// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Staking
 * @dev Staking contract for ECO tokens with compound interest rewards
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.8, 9.1, 9.3, 10.1, 10.2, 10.3, 10.4, 30.1, 30.6, 30.7
 */
contract Staking is ReentrancyGuard, Ownable, Pausable {
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
    
    // ============ Constructor ============
    
    constructor(address _ecoToken) Ownable(msg.sender) {
        require(_ecoToken != address(0), "Staking: Invalid token address");
        ecoToken = IERC20(_ecoToken);
        stakeIdCounter = 1;
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
        // Validate amount
        require(amount >= MINIMUM_STAKE, "Staking: Amount must be >= 100 ECO");
        
        // Validate duration
        require(
            durationDays == 30 || durationDays == 90 || durationDays == 180 || durationDays == 365,
            "Staking: Invalid duration. Must be 30, 90, 180, or 365 days"
        );
        
        // Get APY for duration
        uint256 apy = getAPYForDuration(durationDays);
        
        // Transfer tokens from user to contract
        require(
            ecoToken.transferFrom(msg.sender, address(this), amount),
            "Staking: Token transfer failed"
        );
        
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
        
        // Emit event
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
        
        // Validate stake exists and belongs to caller
        require(stakeDetails.staker == msg.sender, "Staking: Not stake owner");
        require(!stakeDetails.withdrawn, "Staking: Already withdrawn");
        
        // Calculate accrued rewards
        uint256 rewards = calculateAccruedRewards(stakeId);
        
        // Check if early withdrawal
        bool isEarlyWithdrawal = block.timestamp < stakeDetails.endTime;
        
        // Calculate penalty if early withdrawal
        uint256 penalty = 0;
        if (isEarlyWithdrawal) {
            penalty = (stakeDetails.amount * EARLY_WITHDRAWAL_PENALTY) / PENALTY_DENOMINATOR;
        }
        
        // Calculate total amount to transfer
        totalAmount = stakeDetails.amount + rewards - penalty;
        
        // Update stake record
        stakeDetails.withdrawn = true;
        stakeDetails.withdrawalTime = block.timestamp;
        stakeDetails.withdrawalAmount = totalAmount;
        stakeDetails.accruedRewards = rewards;
        
        // Transfer tokens to user
        require(
            ecoToken.transfer(msg.sender, totalAmount),
            "Staking: Token transfer failed"
        );
        
        // Emit event
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
        
        // If already withdrawn, return stored rewards
        if (stakeDetails.withdrawn) {
            return stakeDetails.accruedRewards;
        }
        
        // Calculate elapsed time
        uint256 currentTime = block.timestamp;
        if (currentTime > stakeDetails.endTime) {
            currentTime = stakeDetails.endTime;
        }
        
        uint256 elapsedSeconds = currentTime - stakeDetails.startTime;
        uint256 elapsedDays = elapsedSeconds / 1 days;
        
        // If no time has elapsed, return 0
        if (elapsedDays == 0) {
            return 0;
        }
        
        // Calculate compound interest
        // Using simplified formula: principal × (1 + apy/365)^days
        // For precision, we use: (principal × (365 + apy)^days) / 365^days
        
        uint256 principal = stakeDetails.amount;
        uint256 apy = stakeDetails.apy;
        
        // Calculate (1 + apy/365) with precision
        // We multiply by 1e18 for precision
        uint256 rate = (1e18 * (DAYS_PER_YEAR * 1e18 + apy * 1e16)) / (DAYS_PER_YEAR * 1e18);
        
        // Calculate rate^days using iterative multiplication
        uint256 compounded = 1e18;
        for (uint256 i = 0; i < elapsedDays; i++) {
            compounded = (compounded * rate) / 1e18;
            // Prevent overflow
            if (compounded > 1e36) break;
        }
        
        // Calculate final amount and subtract principal
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
        if (durationDays == 30) {
            return APY_30_DAYS;
        } else if (durationDays == 90) {
            return APY_90_DAYS;
        } else if (durationDays == 180) {
            return APY_180_DAYS;
        } else if (durationDays == 365) {
            return APY_365_DAYS;
        }
        
        revert("Staking: Invalid duration");
    }
    
    // ============ Query Functions ============
    
    /**
     * @dev Get all stakes for a user
     */
    function getUserStakes(address user) 
        external 
        view 
        returns (uint256[] memory)
    {
        return userStakes[user];
    }
    
    /**
     * @dev Get stake details
     */
    function getStakeDetails(uint256 stakeId) 
        external 
        view 
        returns (StakeDetails memory)
    {
        return stakes[stakeId];
    }
    
    /**
     * @dev Get current accrued rewards for a stake
     */
    function getAccruedRewards(uint256 stakeId) 
        external 
        view 
        returns (uint256)
    {
        return calculateAccruedRewards(stakeId);
    }
    
    /**
     * @dev Get total staked amount for a user
     */
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
    
    /**
     * @dev Emergency unpause function
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause();
    }
    
    /**
     * @dev Recover tokens sent to contract by mistake
     */
    function recoverTokens(address token, uint256 amount) 
        external 
        onlyOwner 
    {
        require(token != address(ecoToken), "Staking: Cannot recover staking token");
        require(IERC20(token).transfer(msg.sender, amount), "Staking: Transfer failed");
    }
}
