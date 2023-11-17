const path = require("node:path");
const fs = require("fs");
const axios = require("axios");

const COOKIES_PATH = path.join(
  __dirname,
  "../../store/cookies-shopee-tools.json"
);

function saveCookies(config) {
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(config));
}
function handleCookies(payload) {
  // Simulate an authentication request and return the obtained cookie
  return new Promise((resolve, reject) => {
    // Your authentication logic here, for example using axios
    axios
      .post(`${process.env.BASE_URL}/users/authenticate`, payload)
      .then((response) => {
        // Assuming the authentication endpoint returns a 'Set-Cookie' header
        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
          // Check if setCookieHeader is an array (multiple cookies) or a string (single cookie)
          const cookies = Array.isArray(setCookieHeader)
            ? setCookieHeader
            : [setCookieHeader];

          // Extract the first cookie
          const cookie = cookies[0].split(";")[0];

          resolve(cookie);
        } else {
          reject(new Error("Authentication failed."));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function authenticateUserShopeeTools(payload) {
  try {
    // Simulate successful authentication and obtain a cookie
    handleCookies(payload)
      .then((cookie) => {
        // Store the obtained authentication cookie
        saveCookies(cookie);
      })

      .catch((error) => {
        console.error("Authentication Error:", error.message);
      });
  } catch (error) {
    console.log(error);
  }
}
module.exports = { authenticateUserShopeeTools };
