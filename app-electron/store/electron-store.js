const ElectronStore = require("electron-store");

// Create a single shared ElectronStore instance
const store = new ElectronStore({
  name: 'app-data', // Ensure consistent store file
});

console.log("Shared ElectronStore initialized at:", store.path);

module.exports = store;