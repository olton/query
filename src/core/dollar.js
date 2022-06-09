import {each} from "../helpers/each.js"
import {query} from "./query.js"
import {DollarEvents} from "../plugins/events.js"
import {matches} from "../helpers/matches.js"
import {DataSet} from "./data.js"
import {appendScript} from "../plugins/script.js"
import {Serialize} from "../plugins/serialize.js"
import {isLocalhost} from "../helpers/is-localhost.js"
import {isTouchable} from "../helpers/is-touchable.js"
import {exec} from "../helpers/exec.js"

const $ = query

$.dataset = new DataSet()
$.matches = matches
$.html = $('html')
$.doctype = $("doctype")
$.head = $('head')
$.body = $('body')
$.document = $('document')
$.window = $('window')
$.meta = name => !name ? $("meta") : $("meta[name=$name]".replace("$name", name))
$.metaBy = name => !name ? $.meta : $("meta[$name]".replace("$name", name))
$.charset = val => {
    if (val) {
        const m = $('meta[charset]')
        if (m.length > 0) {
            m.attr('charset', val)
        }
    }
    return document.characterSet
}

$.each = function(ctx, cb){ return each(ctx, cb) }
$.proxy = (fn, ctx) => typeof fn !== "function" ? undefined : fn.bind(ctx)
$.bind = (fn, ctx) => $.proxy(fn, ctx)
$.script = function(el, context = document.body){
    if (typeof el !== "string" || !el instanceof HTMLElement) {
        return
    }
    each(this(el), function(){
        const scr = this
        if (scr.tagName && scr.tagName === "SCRIPT") {
            const s = document.createElement('script')
            s.type = 'text/javascript'
            if (scr.src) {
                s.src = scr.src
            } else {
                s.textContent = scr.innerText
            }
            if (!context instanceof HTMLElement) {
                return
            }
            context.appendChild(s)
            if (scr.parentNode) scr.parentNode.removeChild(scr)
            return s
        }
    })
}

Object.assign($, DollarEvents, Serialize)
Object.assign($, {
    device: (/android|wearos|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),
    localhost: isLocalhost(),
    isLocalhost: isLocalhost,
    touchable: isTouchable(),
})

$.script = appendScript

$.noop = () => {}
$.noop_true = () => true
$.noop_false = () => false
$.exec = exec

$.dark = globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches

let _$ = globalThis.$

$.global = () => {
    _$ = globalThis.$
    globalThis.$ = $
}

$.noConflict = () => {
    if ( globalThis.$ === $ ) {
        globalThis.$ = _$
    }
    return $
}

export {
    $
}