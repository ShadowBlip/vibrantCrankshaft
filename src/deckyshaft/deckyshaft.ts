import { SMM } from "@crankshaft/types";

const DECKYSHAFT = "deckyshaft.py";

function isJsonString(str: any) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ServerAPI {
  private smm: SMM;
  private plugin: string;
  private socket: string;
  private pid?: number;
  constructor(smm: SMM, plugin: string, socket?: string) {
    this.smm = smm;
    this.plugin = plugin;
    this.socket = socket ? socket : "/tmp/plugin.sock";
  }

  // Start the backend plugin server
  async start(): Promise<{ pid: number }> {
    console.log(`Starting backend plugin server on ${this.socket}`);
    const deckyshaft = await this.getDeckyshaftBin();
    const out = await this.smm.Exec.start("python", [
      deckyshaft,
      "-s",
      this.socket,
      "server",
    ]);
    this.pid = out.pid;
    await delay(1000);
    console.log(`Backend plugin server started on ${this.socket}`);
    return out;
  }

  // Stop the backend plugin server
  async stop() {
    if (!this.pid) {
      throw new Error("server hasn't started yet");
    }
    console.log(`Stopping backend plugin server on ${this.socket}`);
    await this.smm.Exec.stop(this.pid, true);
    console.log(`Backend plugin server stopped`);
  }

  // Call a method from the plugin server
  async callPluginMethod(method: string, args: any[]): Promise<any> {
    console.log(`Calling plugin method: ${method}(${args})`);
    const strArgs = args.map((arg) => `${arg}`);
    const deckyshaft = await this.getDeckyshaftBin();
    const out = await this.smm.Exec.run("python", [
      deckyshaft,
      "-s",
      this.socket,
      "client",
      method,
      ...strArgs,
    ]);

    if (out.exitCode !== 0) {
      throw new Error(
        `non-zero exit code calling plugin method: ${JSON.stringify(out)}`
      );
    }
    console.log(`Plugin method returned: ${JSON.stringify(out)}`);

    // Convert the stdout to their concrete types
    if (out.stdout === "True") {
      return true;
    }
    if (out.stdout === "False") {
      return false;
    }
    if (isNaN(+out.stdout)) {
      if (isJsonString(out.stdout)) {
        return JSON.parse(out.stdout);
      }
      return out.stdout;
    }
    return +out.stdout;
  }

  async getPluginDir(): Promise<string> {
    const pluginsDir = await this.smm.FS.getPluginsPath();
    return `${pluginsDir}/${this.plugin}`;
  }

  async getDeckyshaftBin(): Promise<string> {
    const pluginDir = await this.getPluginDir();
    return `${pluginDir}/bin/${DECKYSHAFT}`;
  }
}
