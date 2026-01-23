const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  check: () => ipcRenderer.invoke("check"),
  enroll: (code) => ipcRenderer.invoke("enroll", code)
});
