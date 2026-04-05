module.exports = {
  ROLES: {
    ADMIN: 'admin',
    EXCO: 'exco',
    MEMBER: 'member',
  },
  PAYMENT: {
    ANNUAL_DUE: 10000,
    YEAR: 2026,
    BANK_NAME: 'Access Bank',
    ACCOUNT_NUMBER: '0760005400',
    ACCOUNT_NAME: 'STOBA 98',
  },
  QUARTERLY_MONTHS: [2, 5, 8, 11], // March, June, September, December (0-indexed)
  PAYMENT_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },
};
