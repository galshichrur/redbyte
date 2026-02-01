const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let cpp;
let win;

function createWindow() {
   win = new BrowserWindow({
      width: 750,
      height: 600,
      icon: path.join(__dirname, './assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("renderer/index.html");
  win.removeMenu();

  cpp = spawn(path.join(process.resourcesPath, "backend", "agent.exe"));

  cpp.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      const msg = JSON.parse(line);
      win.webContents.send("backend-msg", msg);
    }
  });
}

ipcMain.on("submit-code", (_, code) => {
  cpp.stdin.write(JSON.stringify({
    type: "submit_code",
    code
  }) + "\n");
});

app.whenReady().then(createWindow);