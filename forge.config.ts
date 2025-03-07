import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerZIP } from "@electron-forge/maker-zip";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: "Meridia",
    executableName: "Meridia",
    icon: "./src/assets/icon.ico",
    appVersion: "beta",
  },

  makers: [
    new MakerSquirrel({
      name: "Meridia",
      setupExe: "MeridiaSetup",
      setupMsi: "MeridiaMsiSetup",
      noMsi: false,
      setupIcon: "./src/assets/icon.ico",
      exe: "Meridia",
      title: "Meridia",
      iconUrl: "./src/assets/icon.ico",
      owners: "MNovus",
      authors: "MNovus",
      description: "The new world of Python Development",
      version: "beta",
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
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./main/html/index.html",
            js: "./main/renderer/renderer.ts",
            name: "main_window",
            preload: {
              js: "./main/preload.ts",
            },
          },
          {
            html: "./main/html/toolsWindow.html",
            js: "./main/renderer/toolsRenderer.ts",
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
