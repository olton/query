import {undef} from "../helpers/undef.js";
import {bool} from "../helpers/bool.js";

export const Position = {
    offset: function(val){
        if (this.length === 0) return

        if (undef(val)) {
            if (this.length === 0) return undefined;
            const rect = this[0].getBoundingClientRect();
            return {
                top: rect.top + scrollY,
                left: rect.left + scrollX
            };
        }

        return this.each(function(){ //?
            const el = $(this)
            let top = val.top, left = val.left
            const position = getComputedStyle(this).position
            const offset = el.offset();

            if (position === "static") {
                el.css("position", "relative");
            }

            if (["absolute", "fixed"].indexOf(position) === -1) {
                top = top - offset.top;
                left = left - offset.left;
            }

            el.css({
                top: top,
                left: left
            });
        });
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