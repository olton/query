import {undef} from "../helpers/undef.js"

export const Size = {
    _size: function(prop, val){
        if (this.length === 0) return

        if (undef(val)) {
            const el = this[0]
            if (prop === 'height') {
                return el === window ? window.innerHeight : el === document ? el.body.clientHeight : parseInt(getComputedStyle(el).height)
            }
            if (prop === 'width') {
                return el === window ? window.innerWidth : el === document ? el.body.clientWidth : parseInt(getComputedStyle(el).width)
            }
        }

        return this.each((_, el) => {
            if (el === window || el === document) {return }
            if (el.style.hasOwnProperty(prop)) {
                el.style[prop] = isNaN(val) ? val : val + 'px'
            }
        })
    },

    height: function(val){
        return this._size('height', val)
    },

    width: function(val){
        return this._size('width', val)
    },

    _sizeOut: function(prop, val){
        if (this.length === 0) return

        if (!undef(val) && typeof val !== "boolean") {
            return this.each((_, el) => {
                if (el === window || el === document) {return }
                const style = getComputedStyle(el)
                let h,
                    bs = prop === 'width' ? parseInt(style['border-left-width']) + parseInt(style['border-right-width']) : parseInt(style['border-top-width']) + parseInt(style['border-bottom-width']),
                    pa = prop === 'width' ? parseInt(style['padding-left']) + parseInt(style['padding-right']) : parseInt(style['padding-top']) + parseInt(style['padding-bottom'])

                h = $(el)[prop](val)[prop]() - bs - pa
                el.style[prop] = h + 'px'
            })
        }

        const elem = this[0],
              size = elem[prop === 'width' ? 'offsetWidth' : 'offsetHeight'],
              style = getComputedStyle(elem),
              result = size + parseInt(style[prop === 'width' ? 'margin-left' : 'margin-top']) + parseInt(style[prop === 'width' ? 'margin-right' : 'margin-bottom'])

        return val === true ? result : size
    },

    outerWidth: function(val){
        return this._sizeOut('width', val)
    },

    outerHeight: function(val){
        return this._sizeOut('height', val)
    },

    padding: function(pseudo){
        if (this.length === 0) return
        const style = getComputedStyle(this[0], pseudo)

        return {
            top: parseInt(style["padding-top"]),
            right: parseInt(style["padding-right"]),
            bottom: parseInt(style["padding-bottom"]),
            left: parseInt(style["padding-left"])
        }
    },

    margin: function(pseudo){
        if (this.length === 0) return
        const style = getComputedStyle(this[0], pseudo)

        return {
            top: parseInt(style["margin-top"]),
            right: parseInt(style["margin-right"]),
            bottom: parseInt(style["margin-bottom"]),
            left: parseInt(style["margin-left"])
        }
    },

    border: function(pseudo){
        if (this.length === 0) return
        const style = getComputedStyle(this[0], pseudo)

        return {
            top: parseInt(style["border-top-width"]),
            right: parseInt(style["border-right-width"]),
            bottom: parseInt(style["border-bottom-width"]),
            left: parseInt(style["border-left-width"])
        }
    }
}