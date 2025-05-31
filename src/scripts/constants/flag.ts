// common
const flag = "flags";
export const scope = "interactive-light";

// Light
export const interactiveName = "interactive";
export const pathName = "path";
export const tileIdName = "tile-id";
export const actorIdName = 'actor-id';
export const tokenIdName = 'token-id';
export const interactive = `${flag}.${scope}.${interactiveName}`;
export const path = `${flag}.${scope}.${pathName}`;
export const tokenId = `${flag}.${scope}.${tokenIdName}`;

// Tile/token
export const lightIdName = "light-id";

export * as flag from "./flag";
