import { app, BrowserWindow } from "electron";
import * as path from "path";
import { registerIpcHandlers } from "./ipc";
import { registerMainWindow as registerConfirmWindow } from "../core/confirmationBroker";
import {
  registerMainWindow as registerSchedulerWindow,
  startScheduler,
  stopScheduler,
} from "../core/scheduler";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    title: "Jarvis",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  registerConfirmWindow(mainWindow);
  registerSchedulerWindow(mainWindow);
  registerIpcHandlers(mainWindow);
  startScheduler();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  stopScheduler();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
