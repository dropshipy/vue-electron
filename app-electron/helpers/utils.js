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

// example : generateCustomSelector('div','test)
const generateCustomSelector = (element, text) =>
  `; //${element}[contains(text(),'${text}')]`;

const waitForElementWithText = async (page, element, text) => {
  const selector = generateCustomSelector(element, text);

  try {
    await page.waitForXPath(selector);
  } catch (error) {
    console.error(`Error: Element with text '${text}' not found`);
  }
};

// example   clickByText(page, "test");
const clickByText = async (page, text) => {
  const xpath = `// *[contains(text(), '${text}')]`;
  try {
    await page.waitForXPath(xpath);
    const [element] = await page.$x(xpath);

    if (element) {
      await element.click();
    } else {
      console.error(`Element with text '${text}' not found`);
    }
  } catch (error) {
    console.error(`Error while waiting for XPath: ${error}`);
  }
};

async function waitForLocalStorageData(page, key) {
  await page.waitForFunction(
    (key) => {
      return localStorage.getItem(key) !== null;
    },
    {},
    key
  );
}

async function getLocalStorageData(page, key) {
  return page.evaluate((key) => {
    return localStorage.getItem(key);
  }, key);
}

async function checkSelector(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

const deleteNewLineAndSpaces = function (teks) {
  return teks.replace(/[\n\s]/g, "");
};

module.exports = {
  waitForTimeout,
  parseCookieHeader,
  saveCookies,
  loadCookies,
  generateCustomSelector,
  waitForElementWithText,
  // waitAndClick,
  clickByText,
  waitForLocalStorageData,
  getLocalStorageData,
  checkSelector,
  deleteNewLineAndSpaces,
};
