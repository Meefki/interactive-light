export function fillTemplate(template: string, values: Record<string, unknown>): string {
    return template.replace(/\${(\w+)}/g, (_, key) => 
        values[key] !== undefined ? String(values[key]) : ''
    );
}