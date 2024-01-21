export function formatName(name: string): string {
    return name
        .split('-') // split the string into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
