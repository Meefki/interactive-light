export const TEMPLATE_PATHS = [
    "modules/interactive-light/dist/templates/light-prefab-browser/header.hbs",
    "modules/interactive-light/dist/templates/light-prefab-browser/header-tags.hbs",
    "modules/interactive-light/dist/templates/light-prefab-browser/content.hbs",
    "modules/interactive-light/dist/templates/light-prefab-browser/footer.hbs",
]

export async function preloadTemplates() {
    await foundry.applications.handlebars.loadTemplates(TEMPLATE_PATHS);
}