export const { format: formatNumber } = Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 })
export const { format: formatCoinAmount } = Intl.NumberFormat('en-GB', { maximumFractionDigits: 6 })