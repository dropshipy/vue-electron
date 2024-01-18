const getApiBaseUrl = () => {
  return process.env.APP_NAME === "tiksender"
    ? process.env.API_BASE_URL_TIKSENDER
    : process.env.API_BASE_URL_SUPPORT_SELLER;
};

module.exports = { getApiBaseUrl };
