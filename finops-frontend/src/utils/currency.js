// One currency policy everywhere: INR, en-IN grouping, always two decimals.
const full = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const formatCurrency = (v) => full.format(toNumber(v));
export const formatCompactCurrency = (v) => `₹${compact.format(toNumber(v))}`;

/** Income shows "+", expense shows "−" so the type never relies on colour alone. */
export const formatSignedAmount = (amount, type) =>
  `${type === 'income' ? '+' : '−'}${formatCurrency(Math.abs(toNumber(amount)))}`;
