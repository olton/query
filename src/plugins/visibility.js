import {inViewport} from "../helpers/in-viewport.js";
import {isVisible} from "../helpers/is-visible.js";
import {isHidden} from "../helpers/is-hidden.js";

export const Visibility = {
    inViewport(){
        return this.length ? inViewport(this[0]) : undefined
    },
    isVisible(){
        return this.length ? isVisible(this[0]) : undefined
    },
    isHidden(){
        return this.length ? isHidden(this[0]) : undefined
    }
}