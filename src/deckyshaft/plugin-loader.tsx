import { SMM } from "@crankshaft/types";
import { Plugin, QuickAccessTab, ServerAPI } from "decky-frontend-lib";
import Logger from "./logger";
import TabsHook from "./tabs-hook";

export type DefinePluginFn = (api: ServerAPI) => Plugin;

export default class PluginLoader extends Logger {
  private smm: SMM;
  private tabsHook: TabsHook = new TabsHook();
  private plugins: Plugin[] = [];
  constructor(smm: SMM) {
    super(PluginLoader.name);
    this.smm = smm;
    this.log("Initialized");
  }

  load(pluginDef: DefinePluginFn) {
    this.importReactPlugin(pluginDef);
    for (let plugin of this.plugins) {
      //@ts-ignore
      this.tabsHook.add({
        id: QuickAccessTab.Decky,
        ...plugin,
      });
    }
  }

  private importReactPlugin(pluginDef: DefinePluginFn) {
    //@ts-ignore
    let plugin = pluginDef(this.createPluginAPI(""));
    this.plugins.push({
      ...plugin,
    });
  }

  callServerMethod() {}

  createPluginAPI(pluginName: string): ServerAPI {
    return {
      //@ts-ignore
      routerHook: null,
      toaster: null,
      //@ts-ignore
      callServerMethod: this.callServerMethod,
      //@ts-ignore
      async callPluginMethod(methodName: string, args = {}) {
        // TODO: Call deckyshaft.py
        console.warn("call not implemented");

        return {};
      },
      //@ts-ignore
      fetchNoCors(url: string, request: any = {}) {
        console.warn("call not implemented");
      },
      //@ts-ignore
      executeInTab(tab: string, runAsync: boolean, code: string) {},
      //@ts-ignore
      injectCssIntoTab(tab: string, style: string) {},
      //@ts-ignore
      removeCssFromTab(tab: string, cssId: any) {},
    };
  }
}
