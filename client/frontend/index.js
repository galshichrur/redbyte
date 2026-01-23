const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { execFile } = require("child_process");

function callCpp(args = []) {
  return new Promise((resolve, reject) => {
    execFile("../backend/src/main.exe", args, (err, stdout) => {
      if (err) return reject(err);
      resolve(JSON.parse(stdout));
    });
  });
}

ipcMain.handle("check", async () => {
  return await callCpp(["check"]);
});

ipcMain.handle("enroll", async (_, code) => {
  return await callCpp(["enroll", code]);
});

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  win.loadFile("renderer/index.html");
});
