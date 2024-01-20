const formatCurrency = (amount, locale = "id-ID", currency = "IDR") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default formatCurrency;
