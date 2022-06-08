import {each} from "../helpers/each.js";
import {isPlainObject} from "../helpers/is-plain-object.js";
import {undef} from "../helpers/undef.js";
import {str2array} from "../helpers/str-to-array.js";

export const Attr = {
    attr(name, val){
        const attributes = {}

        if (this.length === 0 && arguments.length === 0) {
            return undefined
        }

        if (this.length && arguments.length === 0) {
            each(this[0].attributes, function(){
                attributes[this.nodeName] = this.nodeValue
            })
            return attributes
        }

        if (arguments.length === 1) {
            return this.length && this[0].nodeType === 1 && this[0].hasAttribute(name) ? this[0].getAttribute(name) : undefined
        }

        return this.each(function(){
            const el = this
            if (isPlainObject(name)) {
                each(name, function(k, v){
                    el.setAttribute(k, v)
                })
            } else {
                val ? el.setAttribute(name, val) : el.removeAttribute(name)
            }
        })
    },

    removeAttr: function(name){
        let attributes

        if (undef(name)) {
            return this.each(function(){
                const el = this
                each(el.attributes, function(){
                    el.removeAttribute(this)
                })
            })
        }

        attributes = typeof name === "string" ? str2array(name, ",") : name

        return this.each(function(){
            const el = this
            each(attributes, function(){
                if (el.hasAttribute(this)) el.removeAttribute(this)
            })
        })
    },

    toggleAttr: function(name, val){
        return this.each(function(){
            const el = this

            if (undef(val)) {
                el.removeAttribute(name)
            } else {
                el.setAttribute(name, val)
            }
        })
    },

    id: function(val){
        return this.length ? val ? this[0].setAttribute("id", val) : this[0].getAttribute("id") : undefined
    }
};