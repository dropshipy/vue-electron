function flags() {
  // shopee-power-tools || support-seller
  const flags = "support-seller";
  const result = {};
  // logo
  if (flags == "shopee-power-tools") {
    result.linkCreator = "login-spt";
    result.logo = "spt.png";
  } else {
    result.linkCreator = "login-spt-ss";
    result.logo = "support-seller.png";
  }
  return result;
}
