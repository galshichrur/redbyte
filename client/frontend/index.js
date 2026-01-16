const { app, BrowserWindow, ipcMain } = require("electron")
const { spawn } = require("child_process")
const path = require("path")

require('dotenv').config(); 

let win
let backend

// Path to the PE
const BACKEND_PATH = path.join(__dirname, process.env.PE_PATH)

// Start C++ backend process
function startBackend() {
  backend = spawn(BACKEND_PATH)
  backend.stdout.on("data", (data) => handleBackendMessage(data.toString()))
  backend.stderr.on("data", (data) => console.error("Backend error:", data.toString()))
}

// Send message to C++ backend
function sendToBackend(msg) {
  backend.stdin.write(JSON.stringify(msg) + "\n")
}

// Handle messages from C++ backend
let pendingResolve = null
function handleBackendMessage(data) {
  try {
    const msg = JSON.parse(data.trim())
    if (pendingResolve) {
      pendingResolve(msg)
      pendingResolve = null
    }
  } catch (e) {}
}

// Send and wait for response
function request(msg) {
  return new Promise((resolve) => {
    pendingResolve = resolve
    sendToBackend(msg)
  })
}

// IPC handlers
ipcMain.handle("check", () => request({ action: "check" }))
ipcMain.handle("enroll", (_, code) => request({ action: "enroll", code }))
ipcMain.handle("close", () => {
  backend?.kill()
  win?.close()
})

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 480,
    resizable: false,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true },
  })
  win.loadFile("renderer/index.html")
}

app.whenReady().then(() => {
  startBackend()
  createWindow()
})

app.on("window-all-closed", () => {
  backend?.kill()
  app.quit()
})
