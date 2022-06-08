import {each} from "../helpers/each.js"
import {uid} from "../helpers/uid.js"
import {isArrayLike} from "../helpers/is-array-like.js"
import {parseHTML} from "../helpers/parse-html.js";
import {Attr} from "../plugins/attr.js";
import {Class} from "../plugins/class.js";
import {Contains} from "../plugins/contains.js";
import {Scroll} from "../plugins/scroll.js";
import {Css} from "../plugins/css.js";

const defaultOptions = {
    uid: 'uid',
    prevObj: null
}

class Query extends Array {
    constructor(selector, context, options) {
        super()

        this.options = Object.assign({}, defaultOptions, options)
        this.length = 0
        this.uid = uid(this.options.uid)
        this.timestamp = + new Date()
        this.selector = typeof selector === "string" ? selector.trim() : selector
        this.context = context
        this.prevObj = this.options.prevObj

        this.init()
    }

    age(){
        return this.timestamp
    }

    each(cb){
        return each(this, cb)
    }

    init(){
        if (!this.selector) {
            return
        }

        if (typeof this.selector === 'function') {
            document.addEventListener('DOMContentLoaded', this.selector, (this.context || false));
            return
        }

        if (this.selector === 'window' || (this.selector && this.selector.self === window)) {
            this[0] = window
            this.length = 1
            return
        }

        if (this.selector === 'doctype' || (this.selector && this.selector.nodeType && this.selector.nodeType === 10)) {
            this[0] = document.doctype
            this.length = 1
            return
        }

        if (this.selector === 'document' || (this.selector && this.selector.nodeType && this.selector.nodeType === 9)) {
            this[0] = document
            this.length = 1
            return
        }

        if (isArrayLike(this.selector)) {
            each(this.selector, (key, val) => {
                this.push(val)
            })
            return
        }

        if (this.selector instanceof HTMLElement) {
            this.push(this.selector)
            return
        }

        if (typeof this.selector === "string") {

            if (this.selector === "#" || this.selector === ".") {
                console.warn("Selector can't be # or .")
                return
            }

            const parsed = parseHTML(this.selector, this.context)
            const DOMSelector = parsed.length === 1 && parsed[0].nodeType === 3

            if (DOMSelector) {
                if (typeof this.context === "string") {
                    this.context = document.querySelectorAll(this.context)
                }

                if (isArrayLike(this.context)) {
                    const r = [], s  = this.selector
                    this.each(function(){
                        [].push.apply(r, this.querySelectorAll(s))
                    })

                    ;[].push.apply(this, r)
                } else {
                    [].push.apply(this, document.querySelectorAll(this.selector))
                }
            } else {
                [].push.apply(this, parsed)

                if (this.length > 0 && this.context !== undefined) {
                    if (this.context instanceof Query) {
                        each(this.context, (key, ctx) => {
                            new Query(ctx).append(this)
                        })
                    } else if (this.context instanceof HTMLElement) {
                        new Query(this.context).append(this)
                    }
                }
            }
        }
    }
}

Query.use = (...mixins) => Object.assign(Query.prototype, ...mixins)

Query.use(Attr, Class, Contains, Css, Scroll)

export {
    Query
}