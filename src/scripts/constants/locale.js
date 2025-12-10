const key = 'INTERACTIVE_LIGHT';

export const label = 'Label';
export const hint = 'Hint';
export const config = 'Config';

export const enabled = `${key}.${config}.Enabled`;
export const path = `${key}.${config}.Path`;
export const clickOptions = `${key}.${config}.ClickOptions`;

export const tablName = `${key}.${config}.TabName`;

export function getKeyed(path) {
    return `${key}.${path}`;
}

export * as locale from "./locale.js";