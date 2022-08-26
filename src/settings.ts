import { DEFAULT_APP } from "./util";

const SETTINGS_KEY = "vibrantDeck";

interface RawAppSetting {
  saturation?: number;
}

export class AppSetting {
  saturation?: number;

  hasSettings(): boolean {
    if (this.saturation != undefined) return true;
    return false;
  }
}

interface RawSettings {
  perApp: { [appId: string]: RawAppSetting };
}

export class Settings {
  perApp: { [appId: string]: AppSetting } = {};

  ensureApp(appId: string): AppSetting {
    if (!(appId in this.perApp)) {
      this.perApp[appId] = new AppSetting();
    }
    return this.perApp[appId];
  }

  appSaturation(appId: string): number {
    // app saturation or global saturation or fallback 100
    if (this.perApp[appId]?.saturation != undefined)
      return this.perApp[appId].saturation!!;
    if (this.perApp[DEFAULT_APP]?.saturation != undefined)
      return this.perApp[DEFAULT_APP].saturation!!;
    return 100;
  }
}

function deserialize(rawSettings: RawSettings): Settings {
  const settings = new Settings();
  for (let appId in rawSettings.perApp) {
    const rawAppSetting = rawSettings.perApp[appId];
    const appSetting = new AppSetting();
    appSetting.saturation = rawAppSetting.saturation;
    settings.perApp[appId] = appSetting;
  }
  return settings;
}

function serialize(settings: Settings): RawSettings {
  const rawSettings: RawSettings = { perApp: {} };
  for (let appId in settings.perApp) {
    const appSetting = settings.perApp[appId];
    const rawAppSetting: RawAppSetting = {};
    rawAppSetting.saturation = appSetting.saturation;
    rawSettings.perApp[appId] = rawAppSetting;
  }
  return rawSettings;
}

export function loadSettingsFromLocalStorage(): Settings {
  const settingsString = localStorage.getItem(SETTINGS_KEY) || "{}";
  const settingsJson = JSON.parse(settingsString);
  const settings = deserialize(settingsJson);
  return settings || new Settings();
}

export function saveSettingsToLocalStorage(settings: Settings) {
  const settingsJson = serialize(settings) || {};
  const settingsString = JSON.stringify(settingsJson);
  localStorage.setItem(SETTINGS_KEY, settingsString);
}
