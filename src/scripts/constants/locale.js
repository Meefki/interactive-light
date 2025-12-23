const key = 'INTERACTIVE_LIGHT';

export const label = 'Label';
export const hint = 'Hint';
export const name = 'Name';
export const title = 'Title';

export const config = 'Config';
export const browser = 'Browser';

export const menu = 'Menu';
export const prefabs = 'Prefabs';

export const enabled = `${key}.${config}.Enabled`;
export const path = `${key}.${config}.Path`;
export const clickOptions = `${key}.${config}.ClickOptions`;

export const tablName = `${key}.${config}.TabName`;

export const menuPrefabsLabel = `${key}.${menu}.${prefabs}.${label}`;
export const menuPrefabsName = `${key}.${menu}.${prefabs}.${name}`;
export const menuPrefabsHint = `${key}.${menu}.${prefabs}.${hint}`;

export const lightPrefabBrowserTitle = `${key}.${menu}.${prefabs}.${browser}.${title}`;

export function getKeyed(path) {
    return `${key}.${path}`;
}

export * as locale from "./locale.js";