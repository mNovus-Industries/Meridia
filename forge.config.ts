import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerDeb } from "@electron-forge/maker-deb";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const config: ForgeConfig = {
  packagerConfig: {
    asar: false,
    name: "Meridia",
    executableName: "Meridia",
    icon: "./src/assets/icon.ico",
    appVersion: "1.0.0",
  },
  makers: [
    new MakerSquirrel({
      name: "Meridia",
      setupExe: "MeridiaSetup.exe",
      setupMsi: "MeridiaMsiSetup.msi",
      noMsi: false,
      setupIcon: "./src/assets/icon.ico",
      exe: "Meridia.exe",
      title: "Meridia",
      iconUrl: "./src/assets/icon.ico",
      owners: "MNovus",
      authors: "MNovus",
      description: "The new world of Python Development",
      version: "1.0.0",
    }),
    new MakerDeb({
      options: {
        name: "Meridia",
        icon: "./src/assets/icon.ico",
        productName: "Meridia",
        description: "The new world of Python Development",
        version: "1.0.0",
        categories: ["Development"],
      },
    }),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./main/static-html/index.html",
            js: "./main/renderer-workers/main-worker.ts",
            name: "main_window",
            preload: {
              js: "./main/preload.ts",
            },
          },
          {
            html: "./main/static-html/toolsWindow.html",
            js: "./main/renderer-workers/tools-worker.ts",
            name: "tools_window",
            preload: {
              js: "./main/preload.ts",
            },
          },
        ],
      },
    }),
  ],
};

export default config;
