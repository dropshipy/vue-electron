export const convertToCompactFormat = (num) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
};

export const convertToFixedNumber = (number, coma) => {
  let result = "";
  result += parseFloat(number).toFixed(coma);
  return result;
};

export const convertToWhatsappNumber = (number) => {
  const cleanedNumber = number.replace(/^0+/, "");

  if (cleanedNumber.startsWith("08")) {
    return "62" + cleanedNumber.slice(2);
  } else {
    return "62" + cleanedNumber;
  }
};
