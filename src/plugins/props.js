import {appendScript} from "./script";
import {undef} from "../helpers/undef.js";
import {isArrayLike} from "../helpers/is-array-like.js";
import {each} from "../helpers/each.js";

export const Props = {
    _prop(prop, value = ''){
        if (arguments.length === 1) {
            return this.length === 0 ? undefined : this[0][prop]
        }

        return this.each((_, el) => {
            if (typeof el[prop] !== "undefined")
                el[prop] = value
        })
    },

    prop(prop, value){
        return arguments.length === 1 ?
            this._prop(prop) :
            this._prop(prop, typeof value === "undefined" ? "" : value)
    },

    val(value){
        if (undef(value)) {
            return !this.length ? undefined : this[0].value
        }

        return this.each((_, el) => {
            if (typeof el.value !== "undefined") {
                el.value = value
            } else {
                el.innerHTML = value
            }
        })
    },

    html(value){
        const that = this, v = []
        if (arguments.length === 0) {
            return this._prop('innerHTML');
        }
        if (typeof value !== 'string' && isArrayLike(value)) {
            each(value, (_, el) => {
                if (el instanceof HTMLElement)
                    v.push(this.outerHTML);
            })
        } else {
            v.push(value)
        }
        that._prop('innerHTML', v.join("\n"))
        return this
    },

    outerHTML(){
        return this._prop('outerHTML');
    },

    text(value){
        return arguments.length === 0 ?
            this._prop('textContent') :
            this._prop('textContent', typeof value === "undefined" ? "" : value);
    },

    innerText(value){
        return arguments.length === 0 ?
            this._prop('innerText') :
            this._prop('innerText', typeof value === "undefined" ? "" : value);
    },

    empty(){
        return this.each((_, el) => {
            if (typeof el.value !== "undefined") {
                el.value = ""
            } else if (typeof el.innerHTML !== "undefined") {
                el.innerHTML = ""
            }
        })
    },

    clear: function(){
        return this.empty()
    }
}
