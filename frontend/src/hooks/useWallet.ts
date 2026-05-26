export const SUPPLIERS: Record<string, EnergySupplier> = {
  renewable: {
    id: 'renewable',
    label: '신재생 에너지',
    emoji: '🍃',
    rate: 150,
    wallet: '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8',
    description: '태양광·풍력 등 친환경 에너지',
  },
  mixed: {
    id: 'mixed',
    label: '일반 혼합 전력',
    emoji: '🏭',
    rate: 100,
    // 🔥 여기를 대표님이 새로 주신 주소로 변경합니다!
    wallet: '0x0C6F6f9FA1BB851AeF9e08c57E4E2a9820858D8e', 
    description: '화석+원자력 혼합 발전',
  },
}
