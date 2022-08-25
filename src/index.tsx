import shim from "./deckyshaft/shim";
import { SMM } from "@crankshaft/types";
import PluginLoader from "./deckyshaft/plugin-loader";
import plugin from "./plugin";

export const load = async (smm: SMM) => {
  console.warn("Decky plugin loaded!");
  console.log(shim);
  //@ts-ignore
  //deckyPlugin = plugin(new ServerAPI(smm));

  const loader = new PluginLoader(smm);
  loader.log("Added");
  loader.load(plugin);

  const render = async (_smm: SMM): Promise<ReactElement> => {
    return (
      <div id="decky-root">
        <div>Hello world!</div>
      </div>
    );
  };

  //smm.MenuManager.addMenuItem({
  //  id: "vibrant-crankshaft",
  //  label: "vibrantCrankshaft",
  //  render: async (smm: SMM, root: HTMLElement) => {
  //    console.log("Rendering");
  //    //@ts-ignore
  //    window.SP_REACT.render(await render(smm), root);
  //  },
  //});

  //const render = async (_smm: SMM): Promise<ReactElement> => {
  //  return deckyPlugin.content ? deckyPlugin.content : <div></div>;
  //};

  //smm.MenuManager.addMenuItem({
  //  id: "vibrant-crankshaft-main",
  //  label: "vibrantCrankshaft",
  //  render: async (smm: SMM, root: HTMLElement) => {
  //    //@ts-ignore
  //    DECKY_REACTDOM = window.SP_REACTDOM;
  //    console.log("Set decky react dom");
  //  },
  //});

  //smm.InGameMenu._addMenuItem({
  //  id: "vibrant-crankshaft",
  //  title: "vibrantCrankshaft",
  //  render: async (smm: SMM, root: HTMLElement) => {
  //    console.log("DECKY INJECTED");
  //    console.log(window.SP_REACT);
  //    //@ts-ignore
  //    DECKY_REACTDOM.render(await render(smm), root);
  //  },
  //});
};

export const unload = (smm: SMM) => {
  //if (deckyPlugin && deckyPlugin.onDismount) {
  //  deckyPlugin.onDismount();
  //}
  smm.MenuManager.removeMenuItem("vibrant-crankshaft");
  //smm.InGameMenu.removeMenuItem("vibrant-crankshaft");
  console.info("Decky plugin unloaded!");
};
