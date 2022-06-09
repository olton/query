export const isEmptyObject = obj => {
    if (typeof obj !== "object" || obj === null) {
        return undefined;
    }
    for (let name in obj ) {
        if (obj.hasOwnProperty(name)) return false;
    }
    return true;
}