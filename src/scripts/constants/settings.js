export const defaultIconPath = CONST.DEFAULT_TOKEN;
export let tileHeight = game.canvas?.grid?.size ?? 100;
export let tileWidth = game.canvas?.grid?.size ?? 100;
export const actorFolderName = "InteractiveLight";

export const initSettings = () => {
    const gridSize = canvas.grid.size;
    tileHeight = tileWidth = gridSize;
}

export * as settings from "./settings.js";
