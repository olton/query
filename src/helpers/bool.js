import {undef} from "./undef.js";

export const bool = val => {
    if (undef(val)) return false
    if (typeof val === "boolean") return val
    if (typeof val === 'number' && val !== 0) return val
    if (typeof val === 'number' && val === 0) return false
    if (['true', 'ok', 'yes'].includes((""+val).toLowerCase())) return true
    return false
}