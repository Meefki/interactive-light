export const TEMPLATE_PATHS = [
    "modules/interactive-light/dist/templates/light-prefab-browser.hbs"
]

export async function preloadTemplates() {
    await foundry.applications.handlebars.loadTemplates(TEMPLATE_PATHS);
}