// common
const flag = "flags";
export const scope = "interactive-light";

// Light
export const interactiveName = "interactive";
export const pathName = "path";
export const clickOptionsName = 'click-options'
export const tileIdName = "tile-id";
export const actorIdName = 'actor-id';
export const tokenIdName = 'token-id';
export const prefabName = 'prefab-name';
export const interactive = `${flag}.${scope}.${interactiveName}`;
export const path = `${flag}.${scope}.${pathName}`;
export const clickOptions = `${flag}.${scope}.${clickOptionsName}`;
export const tokenId = `${flag}.${scope}.${tokenIdName}`;
export const _prefabName = `${flag}.${scope}.${prefabName}`;

// Tile/token
export const lightIdName = "light-id";

// Library
export const prefabLibraryName = "prefabLibrary";
export const prefabsName = "prefabs";

export * as flag from "./flags.js";
