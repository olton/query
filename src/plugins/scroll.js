import {undef} from "../helpers/undef.js"

export const Scroll = {
    scrollTop: function(val){
        if (undef(val)) {
            return this.length === 0 ? undefined : this[0] === window ? scrollY : this[0].scrollTop
        }

        return this.each(function(){
            this.scrollTop = val
        })
    },

    scrollLeft: function(val){
        if (undef(val)) {
            return this.length === 0 ? undefined : this[0] === window ? scrollX : this[0].scrollLeft
        }

        return this.each(function(){
            this.scrollLeft = val
        })
    }
}