export const generateId = () => {
    const arrayLength = 32;
    const randomNumberRange = 255;

    return Array.from({ length: arrayLength }, () => Math.floor(Math.random() * randomNumberRange));
}