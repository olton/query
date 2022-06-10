import {undef} from "./undef.js";

export function coalesce () {
    const args = [...arguments]
    for(let arg of args) {
        if (!undef(arg)) return arg
    }
    return null
}