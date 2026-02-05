const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let cpp = null;
let win = null;
let rendererReady = false;

function createWindow() {
  win = new BrowserWindow({
    width: 750,
    height: 600,
    icon: path.join(__dirname, "./assets/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("renderer/index.html");
  win.removeMenu();

  const exePath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "agent.exe")
    : path.join(__dirname, "../backend", "cmake-build-debug", "bin", "agent.exe");

  cpp = spawn(exePath);

  cpp.stdout.on("data", (data) => {
    const lines = data.toString().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const msg = JSON.parse(line);
        win.webContents.send("backend-msg", msg);
      } catch (e) {
        console.error("Invalid backend JSON:", line);
      }
    }
  });

  cpp.on("exit", (code) => {
    console.error("Backend exited:", code);
  });

  if (rendererReady) {
    sendInit();
  }
}

function sendInit() {
  if (!cpp || cpp.killed) return;
  cpp.stdin.write(JSON.stringify({ type: "init" }) + "\n");
}

ipcMain.once("renderer-ready", () => {
  rendererReady = true;
  if (cpp) {
    sendInit();
  }
});

ipcMain.on("submit-code", (_, code) => {
  if (!cpp || cpp.killed) return;

  cpp.stdin.write(JSON.stringify({
    type: "submit_code",
    code
  }) + "\n");
});

app.whenReady().then(createWindow);
