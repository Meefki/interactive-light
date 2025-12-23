import { LightPrefabBrowserV2 } from "./light-prefab-browser.js";
import { Logger } from "../utils/logger.js";

export function openLightPrefabBrowser() {
  const id = "light-prefabs";

  if (ui.windows[id]) {
    ui.windows[id].bringToFront();
    return;
  }

  const lightPrefabBrowserApp = new LightPrefabBrowserV2();
  Logger.log("PARTS: ", lightPrefabBrowserApp.constructor.PARTS);
  lightPrefabBrowserApp.render(true);
}