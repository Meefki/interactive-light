export function generateTagColor(label) {
    let hash = 0;

    for (let i = 0; i < label.length; i++) {
        hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    const saturation = 65;
    const lightness = 55;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}