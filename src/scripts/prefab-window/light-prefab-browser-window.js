import { LightPrefabBrowserV2 } from "./light-prefab-browser.js";
import { Logger } from "../utils/logger.js";
import { lightPrefabLibraryJournalName, prefabWindowId } from "../constants/settings.js";
import { flag } from "../constants/flags.js";

export function openLightPrefabBrowser() {
  const openedPrefabBrowser = [...foundry.applications.instances.values()].find(app => app.id === prefabWindowId);
  if (openedPrefabBrowser) {
    openedPrefabBrowser.render();
    return;
  }

  const lightPrefabBrowserApp = new LightPrefabBrowserV2();
  lightPrefabBrowserApp.render(true);
}

export function onUpdateJournalEntryHook(journal, change, options, userId) {
  Logger.log("Journal Entry has been changed", journal, change, journal.getFlag(flag.scope, flag.prefabLibraryName));
  if (journal.getFlag(flag.scope, flag.prefabLibraryName)) {
    Logger.log("Prefab Library has been changed, checking for the openned prefab browser");
    const openedPrefabBrowser = [...foundry.applications.instances.values()].find(app => app.id === prefabWindowId);
    if (openedPrefabBrowser) {
      openedPrefabBrowser.render();
      Logger.log("Prefab window has been re-rendered");
    }
  }
}