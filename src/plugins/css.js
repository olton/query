import {camelCase} from "../helpers/camel-case.js"
import {undef} from "../helpers/undef.js"
import {str2array} from "../helpers/str-to-array.js"
import {each} from "../helpers/each.js"

export const Css = {
    _setStyleProp(el, key, val){
        key = camelCase(key)

        if (["scrollLeft", "scrollTop"].includes(key)) {
            el[key] = (parseInt(val))
        } else {
            el.style[key] = isNaN(val) || ['opacity', 'zIndex'].includes(key) ? val : val + 'px'
        }
    },

    _getStyle(el, prop, pseudo){
        return ["scrollLeft", "scrollTop"].includes(prop) ? $(el)[prop]() : getComputedStyle(el, pseudo)[prop]
    },

    style: function(name, pseudo){
        let el
        const that = this

        if (typeof name === 'string' && this.length === 0) {
            return undefined
        }

        if (this.length === 0) {
            return this
        }

        el = this[0]

        if (undef(name) || name === "all") {
            return getComputedStyle(el, pseudo)
        } else {
            const result = {}, names = name.split(", ").map(function(el){
                return (""+el).trim()
            })

            if (names.length === 1)  {
                return this._getStyle(el, names[0], pseudo)
            } else {
                each(names, function () {
                    const prop = this
                    result[prop] = that._getStyle(el, prop, pseudo)
                })
                return result
            }
        }
    },

    removeStyle: function(name){
        if (undef(name) || this.length === 0) return this

        const names = str2array(name)

        return this.each(function(){
            const el = this
            each(names, function(){
                el.style.removeProperty(this)
            })
        })
    },

    css: function(key, val){
        const that = this

        key = key || 'all'

        if (typeof key === "string" && !val) {
            return  this.style(key)
        }

        return this.each(function(){
            const el = this
            if (typeof key === "object") {
                each(key, function(key, val){
                    that._setStyleProp(el, key, val)
                })
            } else if (typeof key === "string") {
                that._setStyleProp(el, key, val)
            }
        })
    }
}