import {each} from "../helpers/each.js"
import {uid} from "../helpers/uid.js"
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
import {Attr} from "../plugins/attr.js"
import {Class} from "../plugins/class.js"
import {Contains} from "../plugins/contains.js"
import {Scroll} from "../plugins/scroll.js"
import {Css} from "../plugins/css.js"
import {Events} from "../plugins/events.js"
import {DataSet} from "./data"
import {appendScript, Script} from "../plugins/script.js"
import {Manipulations} from "../plugins/manipulations.js"
import {Utils} from "../plugins/utils.js"
import {Visibility} from "../plugins/visibility.js"
import {Props} from "../plugins/props.js"
import {Size} from "../plugins/size.js";
import {Initiator} from "../plugins/init.js";
import {Position} from "../plugins/position.js";
import {Serialize} from "../plugins/serialize.js";

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
}

const query = (...rest) => new Query(...rest)
const $ = query

Query.use = (...mixins) => Object.assign(Query.prototype, ...mixins)
query.use = (...mixins) => Object.assign(query, ...mixins)

Query.use(
    Initiator,
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
    Props,
    Size,
    Position
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
    bind: (fn, ctx) => typeof fn !== "function" ? undefined : fn.bind(ctx),
    proxy: (target, handler) => new Proxy(target, handler),
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
    type: toType,
    isSelector,
    undef,
    iif,
    nvl,
    coalesce,
    serialize: Serialize.serialize
})

Query.use({
    data(key, val){
        let elem, data

        if (this.length === 0) {
            return
        }

        elem = this[0]

        if (!arguments.length) {
            data = $.dataset.get(elem)
            if (!data) {
                data = {}
                for(let attr of [...elem.attributes]) {
                    const attrName = attr.name
                    if (attrName.startsWith('data-')) {
                        const obj = {
                            [attrName]: elem.getAttribute(attrName)
                        }
                        // data.push([attrName, elem.getAttribute(attrName)])
                        data[attrName] = elem.getAttribute(attrName)
                    }
                }
            }
            return data
        }

        if (arguments.length === 1) {
            return $.dataset.get(elem, key) || $.dataset.attr(elem, key)
        }

        return this.each( function() {
            $.dataset.set( this, key, val )
        })
    },

    removeData( key ) {
        return this.each( function() {
            $.dataset.remove( this, key )
        })
    }
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