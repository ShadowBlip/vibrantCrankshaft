import { SMM } from "@crankshaft/types";
import { ServerAPI } from "./deckyshaft/deckyshaft";

type ActiveAppChangedHandler = (newAppId: string, oldAppId: string) => void;
type UnregisterFn = () => void;

export const DEFAULT_APP = "0";

export class RunningApps {
  private listeners: ActiveAppChangedHandler[] = [];
  private lastAppId: string = "";
  private intervalId: any;
  private running: string[] = [];
  private smm: SMM;

  constructor(smm: SMM) {
    this.smm = smm;
  }

  private async pollActive() {
    this.running = await this.getRunning();
    const newApp = this.active();
    if (this.lastAppId != newApp) {
      this.listeners.forEach((h) => h(newApp, this.lastAppId));
    }
    this.lastAppId = newApp;
  }

  register() {
    if (this.intervalId == undefined)
      this.intervalId = setInterval(() => this.pollActive(), 200);
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
    return this.running.length > 0 ? this.running[0] : DEFAULT_APP;
  }

  // NOTE: This is a hack until we can get this functionality native to Crankshaft
  // across all contexts/"tabs"
  private async getRunning(): Promise<string[]> {
    const out = await this.smm.Exec.run("bash", [
      "-c",
      "ps a | grep -Eo 'SteamLaunch AppId=[0-9]+?' | grep -v '=$' | cut -d'=' -f2",
    ]);
    if (out.exitCode !== 0) {
      return [];
    }
    const running = (out.stdout as string)
      .split("\n")
      .filter((appId) => appId !== "");
    return running;
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
