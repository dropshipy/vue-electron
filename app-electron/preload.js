const { contextBridge, ipcRenderer } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: ipcRenderer,
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
contextBridge.exposeInMainWorld("electronStore", {
  get: (key) => store.get(key),
  set: (key, value) => store.set(key, value),
  delete: (key) => store.delete(key),
  clearAll: () => store.clear(),
});
