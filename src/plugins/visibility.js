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
    },

    hide(cb){
        return this.each((_, el) => {
            const displayState = getComputedStyle(el, null)['display']
            $(el).data('display-state', displayState)
            el.style.display = 'none';
            if (typeof cb === "function") {
                cb.apply(el, [el])
            }
        })
    },

    show(cb){
        return this.each((_, el) => {
            const display = $(el).data('display-state')
            el.style.display = display ? display === 'none' ? 'block' : display : ''
            if (parseInt(el.style.opacity) === 0) {
                el.style.opacity = "1"
            }
            if (typeof cb === "function") {
                cb.apply(el, [el])
            }
        })
    },

    visible(mode = true, cb){
        return this.each((_, el) => {
            el.style.visibility = mode ? 'visible' : 'hidden';
            if (typeof cb === "function") {
                cb.apply(el, [el])
            }
        })
    },

    toggle(cb){
        return this.each((_, el) => {
            let func = "show";
            if ( getComputedStyle(el, null)['display'] !== 'none') {
                func = 'hide';
            }
            $(el)[func](cb);
        })
    },

    hidden(mode = true, cb){
        if (typeof mode !== "boolean") {
            mode = false;
        }
        return this.each( (_, el) => {
            el.hidden = mode;
            if (typeof cb === "function") {
                cb.apply(el, [el])
            }
        })
    },

    disable(){
        return this.each((_, el)=>{
            $(el).attr("disabled", "disabled")
        })
    },

    enable(){
        return this.each((_, el)=>{
            $(el).removeAttr("disabled")
        })
    }
}