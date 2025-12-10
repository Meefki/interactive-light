export function fillTemplate(template, values) {
    return template.replace(/\${(\w+)}/g, (_, key) => 
        values[key] !== undefined ? String(values[key]) : ''
    );
}