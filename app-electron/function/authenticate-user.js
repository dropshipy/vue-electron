require("dotenv").config({ path: __dirname + "/../.env" });

const axios = require("axios");
const { getApiBaseUrl } = require("../helpers/api-url");
const store = require("../store/electron-store");

const BASE_URL = getApiBaseUrl();

async function saveTokens(tokens) {
  store.set("jwt-auth-tokens", tokens);
}

function getStoredTokens() {
  return store.get("jwt-auth-tokens") || null;
}

function clearStoredTokens() {
  store.delete("jwt-auth-tokens");
}

function authenticateUser(payload) {
  // Authenticate user and return JWT tokens
  return new Promise((resolve, reject) => {
    axios
      .post(`${BASE_URL}/users/authenticate`, payload)
      .then((response) => {
        // JWT response should contain token and refreshToken
        const { token, refreshToken, user } = response.data;

        if (token) {
          const tokens = {
            token,
            refreshToken,
            user,
            timestamp: new Date().toISOString(),
          };

          saveTokens(tokens);
          resolve(tokens);
        } else {
          reject(new Error("Authentication failed - no token received."));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}
module.exports = {
  authenticateUser,
  getStoredTokens,
  saveTokens,
  clearStoredTokens,
};

