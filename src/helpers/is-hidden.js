import {isVisible} from "./is-visible.js";

export const isHidden = elem => {
    const s = getComputedStyle(elem);
    return !isVisible(elem) || +s['opacity'] === 0 || elem.hidden || s['visibility'] === "hidden";
}