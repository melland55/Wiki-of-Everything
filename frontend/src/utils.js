export function modifyATags(inputString) {
    const regex = /<a>(.*?)<\/a>/g;
    const baseUrl = window.location.origin;
    const modifiedString = inputString.replace(regex, `<a href="${baseUrl}/$1">$1</a>`);
    return modifiedString;
}

export function addBulletPoints(inputString) {
    const regex = /\* /g;
    const modifiedString = inputString.replace(regex, '<br>&nbsp;&nbsp;&nbsp;&nbsp;&bull; ');
    
    return modifiedString;
}

export function addBold(inputString) {
    const regex = /\*\*(.*?)\*\*/g;
    const modifiedString = inputString.replace(regex, '<b>$1</b>');
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