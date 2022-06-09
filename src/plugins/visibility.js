import {inViewport} from "../helpers/in-viewport.js";

export const Visibility = {
    inViewport(){
        return this.length ? inViewport(this[0]) : undefined
    }
}