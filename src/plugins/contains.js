import {isArrayLike} from "../helpers/is-array-like.js"
import {undef} from "../helpers/undef.js"
import {each} from "../helpers/each.js";
import {isVisible} from "../helpers/is-visible";
import {matches} from "../helpers/matches.js";

export const Contains = {
    index(sel, global = true){
        let el, _index = -1

        if (this.length === 0) {
            return _index
        }

        if (undef(sel)) {
            el = this[0]
        } else if (typeof sel === "string") {
            el = $(sel)[0]
        } else if (isArrayLike(sel)) {
            el = sel[0]
        } else {
            el = undefined
        }

        if (undef(el)) {
            return _index
        }

        if (global) {
            if (el && el.parentNode) each(el.parentNode.children, function(i){
                if (this === el) {
                    _index = i
                }
            })
        } else {
            this.each(function(i){
                if (this === el) {
                    _index = i
                }
            })
        }
        return _index
    },

    get(i){
        if (undef(i)) {
            return this
        }
        return i < 0 ? this[ i + this.length ] : this[ i ]
    },

    eq(i){
        return !undef(i) && this.length > 0 ? $(this.get(i), undefined,{prevObj: this}) : this
    },

    is(s){
        let result = false

        if (this.length === 0) {
            return false
        }

        if (isArrayLike(s)) {
            this.each(function(){
                const el = this
                each(s, function(){
                    const sel = this
                    if (el === sel) {
                        result = true
                    }
                })
            })
        } else

        if (s === ":selected") {
            this.each(function(){
                if (!result && this.selected) result = true
            })
        } else

        if (s === ":checked") {
            this.each(function(){
                if (!result && this.checked) result = true
            })
        } else

        if (s === ":visible") {
            this.each(function(){
                if (!result && isVisible(this)) result = true
            })
        } else

        if (s === ":hidden") {
            this.each(function(){
                const styles = getComputedStyle(this)
                if (
                    this.getAttribute('type') === 'hidden'
                    || this.hidden
                    || styles['display'] === 'none'
                    || styles['visibility'] === 'hidden'
                    || parseInt(styles['opacity']) === 0
                ) result = true
            })
        } else

        if (typeof  s === "string") {
            this.each(function(){
                if (matches.call(this, s)) {
                    result = true
                }
            })
        } else

        if (s.nodeType && s.nodeType === 1) {
            this.each(function(){
                if  (this === s) {
                    result = true
                }
            })
        }

        return result
    },

    in(/*Query*/ set){
        let inSet = false
        this.each(function(){
            if (!inSet && set.is(this)) inSet = true
        })
        return inSet
    },

    same(o){
        let result = true
        const _o = $(o)

        if (this.length !== _o.length) return false

        for (let i = 0; i < _o.length; i++) {
            if (_o[i] !== this[i]) {
                result = false
                break
            }
        }

        return result
    },

    last(){
        return this.eq(this.length - 1)
    },

    first(){
        return this.eq(0)
    },

    filter(fn){
        if (typeof fn === "string") {
            let sel = fn
            fn = el => matches.call(el, sel)
        }

        return $([].filter.call(this, fn), undefined,{prevObj: this})
    },

    odd(s){
        let result = this.filter((_, i) => i % 2 === 0)

        if (s) {
            result = result.filter(el => matches.call(el, s))
        }

        return $(result, undefined, {prevObj: this})
    },

    even(s){
        let result = this.filter((_, i) => i % 2 !== 0)

        if (s) {
            result = result.filter((el) => matches.call(el, s))
        }

        return $(result, undefined,{prevObj: this})
    },

    find(s){
        let res = [], result

        if (this.length === 0) {
            result = this // maybe need return undefined ???
        } else {
            this.each(function () {
                const el = this
                if (typeof el.querySelectorAll !== "undefined")
                    res = res.concat([].slice.call(el.querySelectorAll(s)))
            })
            result = $(res)
        }

        return $(result, undefined,{prevObj: this})
    },

    contains(s){
        return this.find(s).length > 0
    },

    children(s){
        let i, res = []

        this.each(function(){
            const el = this
            for(i = 0; i < el.children.length; i++) {
                if (el.children[i].nodeType === 1)
                    res.push(el.children[i])
            }
        })

        res = s ? res.filter(el => matches.call(el, s)) : res

        return $(res, undefined,{prevObj: this})
    },

    parent(s){
        let res = []
        if (this.length === 0) {
            return
        }

        this.each(function(){
            if (this.parentNode) {
                if (!res.includes(this.parentNode))
                    res.push(this.parentNode)
            }
        })

        res = s ? res.filter(el => matches.call(el, s)) : res

        return $(res, undefined,{prevObj: this})
    },

    parents(s){
        let res = []

        if (this.length === 0) {
            return
        }

        this.each(function(){
            let par = this.parentNode
            while (par) {
                if (par.nodeType === 1 && !res.includes(par)) {
                    if (s) {
                        if (matches.call(par, s)) {
                            res.push(par)
                        }
                    } else {
                        res.push(par)
                    }
                }
                par = par.parentNode
            }
        })

        return $(res, undefined,{prevObj: this})
    },

    siblings(s){
        let res = []

        if (this.length === 0) {
            return
        }

        this.each(function(){
            const el = this
            if (el.parentNode) {
                each(el.parentNode.children, function(){
                    if (el !== this) res.push(this)
                })
            }
        })

        if (s) {
            res = res.filter(el => matches.call(el, s))
        }

        return $(res, undefined,{prevObj: this})
    },

    _siblingAll(dir, s){
        let res = []

        if (this.length === 0) {
            return
        }

        this.each(function(){
            let el = this
            while (el) {
                el = el[dir]
                if (!el) break
                res.push(el)
            }
        })

        if (s) {
            res = res.filter(el => matches.call(el, s))
        }

        return $(res, undefined,{prevObj: this})
    },

    _sibling(dir, s){
        let res = []

        if (this.length === 0) {
            return
        }

        this.each(function(){
            const el = this[dir]
            if (el && el.nodeType === 1) {
                res.push(el)
            }
        })

        if (s) {
            res = res.filter(el => matches.call(el, s))
        }

        return $(res, undefined,{prevObj: this})
    },

    prev(s){
        return this._sibling('previousElementSibling', s)
    },

    next(s){
        return this._sibling('nextElementSibling', s)
    },

    prevAll(s){
        return this._siblingAll('previousElementSibling', s)
    },

    nextAll(s){
        return this._siblingAll('nextElementSibling', s)
    },

    closest(s){
        const res = []

        if (this.length === 0) {
            return
        }

        if (!s) {
            return this.parent(s)
        }

        this.each(function(){
            let el = this
            while (el) {
                if (!el) break
                if (matches.call(el, s)) {
                    res.push(el)
                    return
                }
                el = el.parentElement
            }
        })

        return $(res.reverse(), undefined,{prevObj: this})
    },

    has(s){
        const res = []

        if (this.length === 0) {
            return
        }

        this.each(function(){
            const el = this
            const child = $(el).children(s)
            if (child.length > 0) {
                res.push(this)
            }
        })

        return $(res, undefined,{prevObj: this})
    },

    back(to_start = false){
        let ret
        if (to_start) {
            ret = this.prevObj
            while (ret) {
                if (!ret.prevObj) break
                ret = ret.prevObj
            }
        } else {
            ret = this.prevObj ? this.prevObj : this
        }
        return ret
    }
}