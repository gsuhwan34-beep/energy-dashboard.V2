// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProducerEnergyLedger (v2 — IoT 미터와 분리)
 *
 * 배포: 테스트넷 가스만 있는 **새 지갑**으로 Remix 배포 (메인/고액 지갑 사용 금지)
 * WON: 0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB
 *
 * - IoT → 기존 생산자 미터(0x9F9013...) EnergyProduced (주소 변경 없음)
 * - 이 원장 → setRate, purchaseEnergy, totalSoldWh, EnergySold
 * - 생산량 = 미터 이벤트 합산 (대시보드가 읽음)
 * - 판매 가능 잔여 = 미터 생산 합 − 원장 totalSoldWh (대시보드가 계산)
 * - purchaseEnergy는 원장에 판매량만 기록 (미터와 별도 sync 불필요)
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ProducerEnergyLedger {
    error Unauthorized();
    error InvalidProducer();
    error InvalidAmount();
    error InvalidRate();
    error PaymentFailed();

    struct ProducerStats {
        uint128 totalSoldWh;
        uint40 lastUpdate;
    }

    address public immutable owner;
    IERC20 public immutable wonToken;

    mapping(address => uint256) public ratePerKwh;
    mapping(address => ProducerStats) public stats;

    event EnergySold(
        address indexed producer,
        address indexed buyer,
        uint256 soldWh,
        uint256 cumulativeSoldWh,
        uint256 wonPaid,
        uint256 timestamp
    );

    event RateSet(address indexed producer, uint256 ratePerKwh);

    constructor(address wonTokenAddress) {
        if (wonTokenAddress == address(0)) revert InvalidProducer();
        owner = msg.sender;
        wonToken = IERC20(wonTokenAddress);
    }

    /// 생산자가 직접 단가 설정
    function setRate(uint256 rate) external {
        if (rate < 10 || rate > 10_000) revert InvalidRate();
        ratePerKwh[msg.sender] = rate;
        emit RateSet(msg.sender, rate);
    }

    /// owner가 특정 생산자 단가 대리 설정 (선택)
    function setRateFor(address producer, uint256 rate) external onlyOwner {
        if (producer == address(0)) revert InvalidProducer();
        if (rate < 10 || rate > 10_000) revert InvalidRate();
        ratePerKwh[producer] = rate;
        emit RateSet(producer, rate);
    }

    /**
     * P2P 구매 — WON 전송 + totalSoldWh 증가 + EnergySold 이벤트
     * 재고 상한(미터 생산량)은 대시보드가 정산 전 검증
     */
    function purchaseEnergy(address producer, uint256 whAmount) external {
        if (producer == address(0)) revert InvalidProducer();
        if (whAmount == 0) revert InvalidAmount();

        uint256 rate = ratePerKwh[producer];
        if (rate == 0) revert InvalidRate();

        uint256 wonCost = (whAmount * rate * 1e18) / 1000;
        if (!wonToken.transferFrom(msg.sender, producer, wonCost)) revert PaymentFailed();

        ProducerStats storage s = stats[producer];
        uint256 newSold = uint256(s.totalSoldWh) + whAmount;
        if (newSold > type(uint128).max) revert InvalidAmount();

        s.totalSoldWh = uint128(newSold);
        s.lastUpdate = uint40(block.timestamp);

        emit EnergySold(producer, msg.sender, whAmount, newSold, wonCost, block.timestamp);
    }

    /// getStats — totalProducedWh/availableWh는 0 (생산·잔여는 미터 이벤트 + soldWh로 계산)
    function getStats(address producer)
        external
        view
        returns (
            uint256 totalProducedWh,
            uint256 totalSoldWh,
            uint256 availableWh,
            uint256 lastUpdate,
            uint256 rate
        )
    {
        ProducerStats storage s = stats[producer];
        totalProducedWh = 0;
        totalSoldWh = s.totalSoldWh;
        availableWh = 0;
        lastUpdate = s.lastUpdate;
        rate = ratePerKwh[producer];
    }

    function getTotalSoldWh(address producer) external view returns (uint256) {
        return stats[producer].totalSoldWh;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
}
