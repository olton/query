import {each} from "../helpers/each.js"
import {uid} from "../helpers/uid.js"
import {isArrayLike} from "../helpers/is-array-like.js"
import {parseHTML} from "../helpers/parse-html.js"
import {matches} from "../helpers/matches.js"
import {isLocalhost} from "../helpers/is-localhost.js"
import {isTouchable} from "../helpers/is-touchable.js"
import {exec} from "../helpers/exec.js"
import {isPrivateAddress} from "../helpers/is-private-address.js"
import {isVisible} from "../helpers/is-visible.js"
import {isHidden} from "../helpers/is-hidden.js"
import {inViewport} from "../helpers/in-viewport.js"
import {toType} from "../helpers/to-type.js"
import {isSelector} from "../helpers/is-selector.js"
import {nvl} from "../helpers/nvl.js"
import {iif} from "../helpers/iif.js"
import {undef} from "../helpers/undef.js"
import {coalesce} from "../helpers/coalesce.js"
import {isPlainObject} from "../helpers/is-plain-object"
import {Attr} from "../plugins/attr.js"
import {Class} from "../plugins/class.js"
import {Contains} from "../plugins/contains.js"
import {Scroll} from "../plugins/scroll.js"
import {Css} from "../plugins/css.js"
import {Events} from "../plugins/events.js"
import {DataSet, QueryDataSet} from "./data"
import {appendScript, Script} from "../plugins/script.js"
import {Manipulations} from "../plugins/manipulations.js"
import {Utils} from "../plugins/utils.js"
import {Visibility} from "../plugins/visibility.js"
import {Props} from "../plugins/props.js"

const defaultOptions = {
    uid: 'uid',
    prevObj: null
}

class Query extends Array {
    get [Symbol.toStringTag](){return "Query"}

    [Symbol.toPrimitive](hint){
        if (hint === "string") {
            const arr = [...this]
            return JSON.stringify(arr)
        }

        return this.value
    }

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

        if (typeof this.selector === "object" && isArrayLike(this.selector)) {
            each(this.selector, (key, val) => {
                this.push(val instanceof Query ? val[0] : val)
            })
            return
        }

        if (this.selector instanceof HTMLElement) {
            this.push(this.selector)
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

const query = (...rest) => new Query(...rest)
const $ = query

Query.use = (...mixins) => Object.assign(Query.prototype, ...mixins)
query.use = (...mixins) => Object.assign(query, ...mixins)

Query.use(
    QueryDataSet,
    Attr,
    Class,
    Contains,
    Css,
    Scroll,
    Events,
    Script,
    Manipulations,
    Utils,
    Visibility,
    Props
)

query.use({
    dataset: new DataSet(),
    matches: matches,
    html: $('html'),
    doctype: $("doctype"),
    head: $('head'),
    body: $('body'),
    document: $('document'),
    window: $('window'),
    meta: name => !name ? $("meta") : $("meta[name=$name]".replace("$name", name)),
    metaBy: name => !name ? $.meta : $("meta[$name]".replace("$name", name)),
    charset: val => {
        if (val) {
            const m = $('meta[charset]')
            if (m.length > 0) {
                m.attr('charset', val)
            }
        }
        return document.characterSet
    },
    each: function(ctx, cb){ return each(ctx, cb) },
    proxy: (fn, ctx) => typeof fn !== "function" ? undefined : fn.bind(ctx),
    bind: (fn, ctx) => $.proxy(fn, ctx),
    device: (/android|wearos|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),
    localhost: isLocalhost(),
    isLocalhost: isLocalhost,
    privateAddress: isPrivateAddress(),
    isPrivateAddress: isPrivateAddress,
    touchable: isTouchable(),
    script: appendScript,
    noop: () => {},
    noop_true: () => true,
    noop_false: () => false,
    exec: exec,
    dark: globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches,
    isVisible,
    isHidden,
    inViewport,
    toType,
    isSelector,
    undef,
    iif,
    nvl,
    coalesce
})

let _$ = globalThis.$

query.use({
    global(){
        _$ = globalThis.$
        globalThis.$ = $
    },
    noConflict(){
        if ( globalThis.$ === $ ) {
            globalThis.$ = _$
        }
        return $
    }
})

export {
    Query,
    query
}