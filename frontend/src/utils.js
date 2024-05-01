export function modifyATags(inputString) {
    const regex = /<a>(.*?)<\/a>/g;
    const baseUrl = window.location.origin;
    const modifiedString = inputString.replace(regex, `<a href="${baseUrl}/$1">$1</a>`);
    return modifiedString;
}

export function capitalizeString(inputString) {
const excludedWords = ['of', 'the', 'for', 'in', 'and', 'or', 'but', 'with'];
const words = inputString.split(/\s+/);
const capitalizedWords = words.map((word, index) => {
    if (index === 0 || !excludedWords.includes(word.toLowerCase())) {
    return word.charAt(0).toUpperCase() + word.slice(1);
    } else {
    return word.toLowerCase();
    }
});
    return capitalizedWords.join(' ');
}