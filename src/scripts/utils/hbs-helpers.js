export function registedHelpers() {
    Handlebars.registerHelper("includes", (array, value) => {
        if (!Array.isArray(array)) return false;
        return array.includes(value);
    });
}