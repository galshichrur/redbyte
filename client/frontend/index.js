const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let win = null;
let tray = null;
let cpp = null;
let isQuitting = false;
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

  win.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });

  createTray();
  spawnBackend();

  if (rendererReady) sendInit();
}

function createTray() {
  tray = new Tray(path.join(__dirname, "./assets/icon.ico"));

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        if (cpp && !cpp.killed) cpp.kill();
        app.quit();
      }
    }
  ]));

  tray.on("double-click", () => {
    win.show();
    win.focus();
  });
}

function spawnBackend() {
  const exePath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "agent.exe")
    : path.join(__dirname, "../backend", "cmake-build-debug", "bin", "agent.exe");

  cpp = spawn(exePath);

  cpp.stdout.on("data", (data) => {
    data.toString().split(/\r?\n/).filter(Boolean).forEach(line => {
      try {
        win.webContents.send("backend-msg", JSON.parse(line));
      } catch {}
    });
  });
}

function sendInit() {
  if (cpp && !cpp.killed) {
    cpp.stdin.write(JSON.stringify({ type: "init" }) + "\n");
  }
}

ipcMain.once("renderer-ready", () => {
  rendererReady = true;
  if (cpp) sendInit();
});

ipcMain.on("submit-code", (_, code) => {
  if (cpp && !cpp.killed) {
    cpp.stdin.write(JSON.stringify({ type: "submit_code", code }) + "\n");
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", (e) => {
  e.preventDefault();
});
