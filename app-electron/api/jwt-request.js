require("dotenv").config({ path: __dirname + "/../.env" });

const axios = require("axios");
const { getApiBaseUrl } = require("../helpers/api-url");
const {
  getStoredTokens,
  saveTokens,
} = require("../function/authenticate-user");

const BASE_URL = getApiBaseUrl();

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

// Helper to process failed requests queue
function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

// Helper to check if token is expired
function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}

// Helper to refresh JWT token
async function refreshJwtToken() {
  if (isRefreshing) {
    // If already refreshing, return a promise that will be resolved when refresh completes
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const tokens = getStoredTokens();
    console.log("tokens in refresh", tokens);

    if (!tokens || !tokens.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${BASE_URL}/users/refresh-token`, {
      refreshToken: tokens.refreshToken,
    });

    const { token: newToken, refreshToken: newRefreshToken } = response.data;

    if (!newToken) {
      throw new Error("No token received from refresh endpoint");
    }

    // Update stored tokens
    const updatedTokens = {
      ...tokens,
      token: newToken,
      refreshToken: newRefreshToken || tokens.refreshToken,
      timestamp: new Date().toISOString(),
    };
    saveTokens(updatedTokens);

    // Process queued requests
    processQueue(null, newToken);

    return newToken;
  } catch (error) {
    console.log("error refresh token", error);

    // Process failed queue
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

// Helper to get JWT authorization headers with token refresh
async function getAuthHeaders() {
  let tokens = getStoredTokens();
  if (!tokens || !tokens.token) {
    throw new Error("No JWT token available. Please authenticate first.");
  }

  // Check if token is expired and refresh if needed
  if (isTokenExpired(tokens.token)) {
    try {
      const newToken = await refreshJwtToken();
      return {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      throw error;
    }
  }

  return {
    Authorization: `Bearer ${tokens.token}`,
    "Content-Type": "application/json",
  };
}

async function postDataJWT(
  endpoint = "",
  data = {},
  options = {},
  additionalHeaders = {}
) {
  try {
    const url = BASE_URL + endpoint;
    const authHeaders = await getAuthHeaders();
    const response = await axios.post(url, data, {
      ...options,
      headers: {
        ...authHeaders,
        ...additionalHeaders,
      },
    });
    return response;
  } catch (error) {
    console.log(error?.message || error);

    // Handle 401 errors - try token refresh
    if (error.response?.status === 401 && !options._isRetry) {
      try {
        await refreshJwtToken();
        // Retry the request once
        return await postDataJWT(
          endpoint,
          data,
          { ...options, _isRetry: true },
          additionalHeaders
        );
      } catch (refreshError) {
        throw new Error("Authentication expired. Please login again.");
      }
    }

    return error.response;
  }
}

async function getDataJWT(endpoint = "", options = {}) {
  try {
    const url = BASE_URL + endpoint;
    const authHeaders = await getAuthHeaders();

    const response = await axios.get(url, {
      ...options,
      headers: authHeaders,
    });
    return response;
  } catch (error) {
    console.log(error?.message || error);

    // Handle 401 errors - try token refresh
    if (error.response?.status === 401 && !options._isRetry) {
      try {
        await refreshJwtToken();
        // Retry the request once
        return await getDataJWT(endpoint, { ...options, _isRetry: true });
      } catch (refreshError) {
        throw new Error("Authentication expired. Please login again.");
      }
    }

    return error.response;
  }
}

async function patchDataJWT(endpoint = "", data = {}, options = {}) {
  try {
    const url = BASE_URL + endpoint;
    const authHeaders = await getAuthHeaders();
    const response = await axios.patch(url, data, {
      ...options,
      headers: authHeaders,
    });
    return response;
  } catch (error) {
    console.log(error?.message || error);

    // Handle 401 errors - try token refresh
    if (error.response?.status === 401 && !options._isRetry) {
      try {
        await refreshJwtToken();
        // Retry the request once
        return await patchDataJWT(endpoint, data, {
          ...options,
          _isRetry: true,
        });
      } catch (refreshError) {
        throw new Error("Authentication expired. Please login again.");
      }
    }

    return error.response;
  }
}

async function deleteDataJWT(endpoint = "", options = {}) {
  try {
    const url = BASE_URL + endpoint;
    const authHeaders = await getAuthHeaders();
    const response = await axios.delete(url, {
      ...options,
      headers: authHeaders,
    });
    return response;
  } catch (error) {
    console.log(error?.message || error);

    // Handle 401 errors - try token refresh
    if (error.response?.status === 401 && !options._isRetry) {
      try {
        await refreshJwtToken();
        // Retry the request once
        return await deleteDataJWT(endpoint, { ...options, _isRetry: true });
      } catch (refreshError) {
        throw new Error("Authentication expired. Please login again.");
      }
    }

    return error.response;
  }
}

module.exports = {
  postDataJWT,
  getDataJWT,
  patchDataJWT,
  deleteDataJWT,
};
