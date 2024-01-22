const formatCurrency = (
  amount,
  opt = {},
  locale = "id-ID",
  currency = "IDR"
) => {
  const compactOptions = {
    notation: "compact",
    compactDisplay: "short",
  };

  const mergedOptions = {
    ...compactOptions,
    ...opt,
  };

  // Check if compact notation is enabled
  if (opt.notation === "compact" && currency === "IDR") {
    // Use the compact notation with 'Rp' symbol
    return `Rp ${new Intl.NumberFormat(locale, mergedOptions).format(amount)}`;
  } else {
    // Use regular currency formatting with 0 decimal places
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2, // Set this to 2 to include two decimal places when not in compact mode
      ...opt,
    }).format(amount);
  }
};

export default formatCurrency;
