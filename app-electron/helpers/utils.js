const path = require("node:path");
const fs = require("fs");

function waitForTimeout(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
async function waitForRandomDelay(min = 1000, max = 4000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
async function promiseWithTimeout(promise, ms = 10000) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } catch (err) {
    console.warn(`[promiseWithTimeout] ${err.message}`);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
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

async function waitForSelectorWithTimeout(page, selector, timeout) {
  try {
    await page.waitForSelector(selector, { timeout });
    console.log(`Selector '${selector}' found within ${timeout}ms.`);
    return true;
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.error(`Timeout waiting for selector '${selector}'.`);
    } else {
      console.error(`Error waiting for selector '${selector}':`, error.message);
    }
    return false;
  }
}

function formatNumberToShortForm(number) {
  if (number <= 0) {
    return "0";
  } else if (number >= 1_000_000_000_000) {
    return Math.floor(number / 1_000_000_000_000) + "T";
  } else if (number >= 1_000_000_000) {
    return Math.floor(number / 1_000_000_000) + "M";
  } else if (number >= 1_000_000) {
    return Math.floor(number / 1_000_000) + "Jt";
  } else if (number >= 1_000) {
    return Math.floor(number / 1_000) + "Rb";
  } else {
    return number.toString();
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // jeda antar scroll
    });
  });
}


module.exports = {
  waitForTimeout,
  waitForRandomDelay,
  promiseWithTimeout,
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
  waitForSelectorWithTimeout,
  formatNumberToShortForm,
  autoScroll,
};
