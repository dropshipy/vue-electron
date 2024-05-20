require("dotenv").config({ path: __dirname + "/../.env" });

const axios = require("axios");
const { getApiBaseUrl } = require("../helpers/api-url");

const BASE_URL = getApiBaseUrl();

async function postData(endpoint = "", data = {}, options = {}) {
  try {
    const url = BASE_URL + endpoint;
    const response = await axios.post(url, data, options);
    return response;
  } catch (error) {
    console.log(error?.message || error);

    return error.response;
  }
}

async function getData(endpoint = "", options = {}, Honeybadger) {
  try {
    const url = BASE_URL + endpoint;
    const response = await axios.get(url, options);
    return response;
  } catch (error) {
    console.log(error?.message || error);
  }
}

async function patchData(endpoint = "", data = {}, options = {}, Honeybadger) {
  try {
    const url = BASE_URL + endpoint;
    const response = await axios.patch(url, data, options);
    return response;
  } catch (error) {
    console.log(error?.message || error);
    return error.message;
  }
}
async function getDataShopee(endpoint = "", options = {}, Honeybadger) {
  try {
    const url = endpoint;

    const response = await axios.get(url, options);
    return response;
  } catch (error) {
    console.log(error?.message || error);
  }
}

async function postDataShopee(
  endpoint = "",
  data = {},
  options = {},
  Honeybadger
) {
  try {
    const response = await axios.post(endpoint, data, options);

    return response;
  } catch (error) {
    console.log(error?.message || error);
    return error.response;
  }
}

module.exports = {
  postData,
  getData,
  patchData,
  postDataShopee,
  getDataShopee,
};
