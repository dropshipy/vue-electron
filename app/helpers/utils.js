const path = require("node:path");
const fs = require("fs");

function waitForTimeout(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
function parseCookieHeader(header) {
  // Split the header into individual name-value pairs
  const pairs = header.split(";");

  // Create an object to store the cookies
  const cookies = {};

  // Loop through the name-value pairs and store them in the object
  for (let i = 0; i < pairs.length; i++) {
    const nameValue = pairs[i].split("=");
    cookies[nameValue[0].trim()] = nameValue[1];
  }

  // Return the object
  return cookies;
}
async function saveCookies(path, config) {
  fs.writeFileSync(path, JSON.stringify(config));
}
async function loadCookies(path) {
  if (fs.existsSync(path)) {
    const cookies = JSON.parse(fs.readFileSync(path, "utf-8"));
    return cookies;
  }
}
module.exports = {
  waitForTimeout,
  parseCookieHeader,
  saveCookies,
  loadCookies,
};
