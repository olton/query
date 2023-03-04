import {isArrayLike} from "../helpers/is-array-like.js";
import {isSelector} from "../helpers/is-selector.js";
import {parseHTML} from "../helpers/parse-html.js";
import {isPlainObject} from "../helpers/is-plain-object.js";
import {each} from "../helpers/each.js";

export const Initiator = {
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

        if (this.selector === 'document' || (this.selector && this.selector.nodeType === 9)) {
            this[0] = document
            this.length = 1
            return
        }

        if (this.selector instanceof HTMLElement) {
            this.push(this.selector)
            return
        }

        if (typeof this.selector === "object" && isArrayLike(this.selector)) {
            each(this.selector, (key, val) => {
                this.push(val instanceof Query ? val[0] : val)
            })
            return
        }

        if (typeof this.selector === 'string' && isSelector(this.selector)) {
            [].push.apply(this, document.querySelectorAll(this.selector))
            return
        }

        if (this.selector === "#" || this.selector === ".") {
            console.warn("Selector can't be # or .")
            return
        }

        if (typeof this.selector === "string") {

            const parsed = parseHTML(this.selector)
            const DOMSelector = parsed.length === 1 && parsed[0].nodeType === 3

            if (DOMSelector) {
                [].push.apply(this, document.querySelectorAll(this.selector))
            } else {
                [].push.apply(this, parsed)
            }

            if (this.length > 0 && this.context) {
                // Additional attributes for elements
                if (typeof this.context === 'object' && isPlainObject(this.context)) {
                    each(this,(_, el) => {
                        for(let name in this.context) {
                            if (this.context.hasOwnProperty(name))
                                el.setAttribute(name, this.context[name])
                        }
                    })
                } else {
                    // Insert elements into context
                    if (typeof this.context === "string") {
                        this.context = $(this.context)
                    }

                    let contextTargets = []

                    if (this.context instanceof HTMLElement) {
                        contextTargets.push(this.context)
                    } else if (isArrayLike(this.context)) {
                        [].push.apply(contextTargets, this.context)
                    }

                    const result = []
                    each(contextTargets, (_, ctx) => {
                        const clone = this.clone(true, true)
                        new Query(ctx).append(clone)
                        each(clone, (_, cl)=>{
                            result.push(cl)
                        })
                    })
                    this.length = 0
                    ;[].push.apply(this, result)
                }
            }
        }
    }
}