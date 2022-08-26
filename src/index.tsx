import { SMM } from "@crankshaft/types";
import {
  loadSettingsFromLocalStorage,
  Settings,
  saveSettingsToLocalStorage,
} from "./settings";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { PanelSection, PanelSectionRow } from "./deck-components/Panel";
import { ToggleField } from "./deck-components/Toggle";
import { ServerAPI } from "./deckyshaft/deckyshaft";
import { Backend, DEFAULT_APP, RunningApps } from "./util";
import { SliderField } from "./deck-components/Slider";

const PLUGIN_ID = "vibrant-crankshaft";
const PLUGIN_NAME = "vibrantCrankshaft";

let settings: Settings;

interface ContentProps {
  runningApps: RunningApps;
  applyFn: (appId: string) => void;
}

function Content({ runningApps, applyFn }: ContentProps) {
  const [initialized, setInitialized] = useState<boolean>(false);

  const [currentAppOverride, setCurrentAppOverride] = useState<boolean>(false);
  const [currentAppOverridable, setCurrentAppOverridable] =
    useState<boolean>(false);
  const [currentTargetSaturation, setCurrentTargetSaturation] =
    useState<number>(100);

  const refresh = () => {
    const activeApp = runningApps.active();
    // does active app have a saved setting
    setCurrentAppOverride(settings.perApp[activeApp]?.hasSettings() || false);
    setCurrentAppOverridable(activeApp != DEFAULT_APP);

    // get configured saturation for current app (also Deck UI!)
    setCurrentTargetSaturation(settings.appSaturation(activeApp));

    setInitialized(true);
  };

  useEffect(() => {
    const activeApp = runningApps.active();
    if (!initialized) return;

    if (currentAppOverride && currentAppOverridable) {
      console.log(
        `Setting app ${activeApp} to saturation ${currentTargetSaturation}`
      );
      settings.ensureApp(activeApp).saturation = currentTargetSaturation;
    } else {
      console.log(`Setting global to saturation ${currentTargetSaturation}`);
      settings.ensureApp(DEFAULT_APP).saturation = currentTargetSaturation;
    }
    applyFn(activeApp);

    saveSettingsToLocalStorage(settings);
  }, [currentTargetSaturation, initialized]);

  useEffect(() => {
    const activeApp = runningApps.active();
    if (!initialized) return;
    if (activeApp == DEFAULT_APP) return;

    console.log(`Setting app ${activeApp} to override ${currentAppOverride}`);

    if (!currentAppOverride) {
      settings.ensureApp(activeApp).saturation = undefined;
      setCurrentTargetSaturation(settings.appSaturation(DEFAULT_APP));
    }
    saveSettingsToLocalStorage(settings);
  }, [currentAppOverride, initialized]);

  useEffect(() => {
    refresh();
    runningApps.listenActiveChange(() => refresh());
  }, []);

  return (
    <PanelSection title="Color Settings">
      <PanelSectionRow>
        <ToggleField
          label="Use per-game profile"
          description={
            "Currently using " +
            (currentAppOverride && currentAppOverridable
              ? "per-app"
              : "global") +
            " profile"
          }
          gamepadGroup="root"
          gamepadItem="per-app-toggle"
          gamepadFocused="true"
          checked={currentAppOverride && currentAppOverridable}
          disabled={!currentAppOverridable}
          onChange={(override) => {
            setCurrentAppOverride(override);
          }}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <SliderField
          label="Saturation"
          description="Control the saturation of the display"
          value={currentTargetSaturation}
          step={20}
          max={400}
          min={0}
          showValue={true}
          gamepadGroup="root"
          gamepadItem="saturation-slider"
          onChange={(saturation: number) => {
            setCurrentTargetSaturation(saturation);
          }}
        />
      </PanelSectionRow>
    </PanelSection>
  );
}

let deckyshaft: ServerAPI;

export const load = async (smm: SMM) => {
  console.info("vibrantCrankshaft plugin loaded!");
  deckyshaft = new ServerAPI(
    smm,
    "vibrantCrankshaft",
    `/tmp/${PLUGIN_ID}.sock`
  );
  await deckyshaft.start();

  // load settings
  console.info("Loading settings from local storage");
  settings = loadSettingsFromLocalStorage();

  console.info("Creating new plugin backend");
  const backend = new Backend(deckyshaft);
  console.info("Creating RunningApps");
  const runningApps = new RunningApps(smm);

  const applySettings = (appId: string) => {
    const saturation = settings.appSaturation(appId);
    backend.applySaturation(saturation);
  };

  console.info("Registering running apps");
  runningApps.register();

  // apply initially
  console.info("Apply initial settings");
  applySettings(runningApps.active());

  smm.InGameMenu.addMenuItem({
    id: PLUGIN_ID,
    title: PLUGIN_NAME,
    render: async (_smm, root) => {
      render(
        <Content runningApps={runningApps} applyFn={applySettings} />,
        root
      );
    },
  });
};

export const unload = (smm: SMM) => {
  smm.InGameMenu.removeMenuItem(PLUGIN_ID);
  if (deckyshaft) {
    deckyshaft.stop();
  }
  console.info("vibrantCrankshaft plugin unloaded!");
};
