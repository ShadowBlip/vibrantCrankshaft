import { SMM } from "@crankshaft/types";
import { ServerAPI } from "./deckyshaft/deckyshaft";

type ActiveAppChangedHandler = (newAppId: string, oldAppId: string) => void;
type UnregisterFn = () => void;

export const DEFAULT_APP = "0";

export class RunningApps {
  private listeners: ActiveAppChangedHandler[] = [];
  private lastAppId: string = "";
  private intervalId: any;
  private smm: SMM;

  constructor(smm: SMM) {
    this.smm = smm;
  }

  private pollActive() {
    const newApp = this.active();
    if (this.lastAppId != newApp) {
      this.listeners.forEach((h) => h(newApp, this.lastAppId));
    }
    this.lastAppId = newApp;
  }

  register() {
    if (this.intervalId == undefined)
      this.intervalId = setInterval(() => this.pollActive(), 100);
  }

  unregister() {
    if (this.intervalId != undefined) clearInterval(this.intervalId);

    this.listeners.splice(0, this.listeners.length);
  }

  listenActiveChange(fn: ActiveAppChangedHandler): UnregisterFn {
    const idx = this.listeners.push(fn) - 1;
    return () => {
      this.listeners.splice(idx, 1);
    };
  }

  active() {
    return this.smm.currentAppId || DEFAULT_APP;
  }
}

export class Backend {
  private serverAPI: ServerAPI;

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  applySaturation(saturation: number) {
    console.log("Applying saturation " + saturation.toString());
    this.serverAPI.callPluginMethod("set_saturation", [saturation / 100.0]);
  }
}
