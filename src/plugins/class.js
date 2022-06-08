import {each} from "../helpers/each.js";
import {str2array} from "../helpers/str-to-array";

export const Class = {
    addClass(){},
    removeClass(){},
    toggleClass(){},

    hasClass(cls){
        let result = false

        if (!cls || typeof cls !== "string") {
            return false
        }

        this.each((_, el) => {
            each(str2array(cls), (_, c) => {
                if (!result && el.classList && el.classList.contains(c)) {
                    result = true
                }
            })
        })

        return result
    },

    clearClasses(){
        return this.each(function(){
            this.className = ""
        })
    },

    classes(index = 0, asArray = true){
        return this.length === 0 ? undefined : asArray ? str2array(this[0].className) : this[0].className
    },

    removeClassBy(mask){
        return this.each((_, el) => {
            const $el = $(el)
            const classes = $el.classes(0, true)
            $.each(classes, (_, c) => {
                if (c.includes(mask)) {
                    $el.removeClass(c)
                }
            })
        })
    }
}

const methods = ['add', 'remove', 'toggle']

each(methods, (_, m) => {
    Class[`${m}Class`] = function(cls) {
        if (!cls.trim()) return this
        return this.each((_, el)=>{
            const hasClassList = typeof el.classList !== "undefined"
            each(str2array(cls),(_, c) => {
                console.log(`${m}Class ${c}`)
                if (hasClassList) el.classList[m](c)
            })
        })
    }
})
