const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  sendCode: (code) => ipcRenderer.send("submit-code", code),
  onBackendMsg: (cb) => ipcRenderer.on("backend-msg", (_, msg) => cb(msg)),
  sendReady: () => ipcRenderer.send("renderer-ready")
});
