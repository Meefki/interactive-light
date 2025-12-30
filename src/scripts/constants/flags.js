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
export const prefabIdName = 'prefab-id';
export const prefabTagsName = 'tags';
export const makePrefabName = `make-prefab`;
export const interactive = `${flag}.${scope}.${interactiveName}`;
export const path = `${flag}.${scope}.${pathName}`;
export const clickOptions = `${flag}.${scope}.${clickOptionsName}`;
export const tokenId = `${flag}.${scope}.${tokenIdName}`;
export const _prefabName = `${flag}.${scope}.${prefabName}`;
export const makePrefab = `${flag}.${scope}.${makePrefabName}`;
export const prefabTags = `${flag}.${scope}.${prefabTagsName}`;

// Tile/token
export const lightIdName = "light-id";

// Library
export const prefabLibraryName = "prefabLibrary";
export const prefabsName = "prefabs";

export * as flag from "./flags.js";
