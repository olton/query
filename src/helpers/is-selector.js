const queryCheck = s => document.createDocumentFragment().querySelector(s)

export const isSelector = selector => {
    try {
        queryCheck(selector);
        return true;
    } catch {
        return false
    }
}