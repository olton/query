import {undef} from "../helpers/undef.js";
import {bool} from "../helpers/bool.js";

export const Position = {
    offset: function(){
        if (this.length === 0) return

        const el = this[0]
        return {
            top: el.offsetTop,
            left: el.offsetLeft,
            height: el.offsetHeight,
            width: el.offsetWidth,
            parent: el.offsetParent
        }
    },

    position: function(margin){
        let ml = 0, mt = 0, el, style

        if (this.length === 0) return

        el = this[0]
        style = getComputedStyle(el)

        if (bool(margin)) {
            ml = parseInt(style['margin-left'])
            mt = parseInt(style['margin-top'])
        }

        return {
            left: el.offsetLeft - ml,
            top: el.offsetTop - mt
        }
    },

    left: function(val, margin){
        if (this.length === 0) return

        if (undef(val)) {
            return this.position(margin).left
        }

        if (typeof val === "boolean") {
            margin = val
            return this.position(margin).left
        }

        return this.each(function(){
            $(this).css({
                left: val
            })
        })
    },

    top: function(val, margin){
        if (this.length === 0) return

        if (undef(val)) {
            return this.position(margin).top
        }

        if (typeof val === "boolean") {
            margin = val
            return this.position(margin).top
        }

        return this.each(function(){
            $(this).css({
                top: val
            })
        })
    },

    coord: function(){
        return this.length === 0 ? undefined : this[0].getBoundingClientRect()
    },

    pos: function(){
        if (this.length === 0) return

        return {
            top: parseInt($(this[0]).style("top")),
            left: parseInt($(this[0]).style("left"))
        }
    }
}