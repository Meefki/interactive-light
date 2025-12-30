import { Logger } from "../utils/logger.js";

export function registedHelpers() {
    Handlebars.registerHelper("includes", (array, value) => {
        if (!Array.isArray(array) || !array.length) return false;
        if (isObject(value)) {
            for (let item of array) {
                if (compareObjects(item, value)) 
                    return true;
            }

            return false;
        }
        else {
            return array.includes(value);
        }
    });
}

function compareObjects(o1, o2) {
    const keys = Object.keys(o1);
    for (let key of keys) {
        let equals = true;
        if (isObject(o1[key]))
            equals = compareObjects(o1[key], o2[key])
        else
            equals = o1[key] === o2[key]
    
        if (!equals) return false;
    }

    return true;
}

function isObject(value) {
    const res = Object.prototype.toString.call(value) === "[object Object]";
    return res;
}