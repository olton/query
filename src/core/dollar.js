import {each} from "../helpers/each.js"
import {Query} from "./query.js"
import {undef} from "../helpers/undef.js"
import {camelCase} from "../helpers/camel-case.js"
import {str2array} from "../helpers/str-to-array.js"

const $ = (s, c, o) => new Query(s, c, o)

$.matches = Element.prototype.matches || Element.prototype["matchesSelector"] || Element.prototype["webkitMatchesSelector"] || Element.prototype["mozMatchesSelector"] || Element.prototype["msMatchesSelector"] || Element.prototype["oMatchesSelector"]
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

$.events = []
$.eventHooks = {}
$.eventUID = -1

Object.assign($, {
    ready(fn, op = false){
        return this(fn, op)
    },

    load(fn, op = false){
        return this(window).on("load", fn, op)
    },

    unload(fn, op = false){
        return this(window).on("unload", fn, op)
    },

    beforeunload(fn, op = false){
        if (typeof fn === "string") {
            return this(window).on("beforeunload", function(e){
                e.returnValue = fn
                return fn
            }, op)
        } else {
            return this(window).on("beforeunload", fn, op)
        }
    },

    setEventHandler: function({element, event, handler, selector, ns, id, options} = args){
        let i, freeIndex = -1, eventObj, resultIndex
        if (this.events.length > 0) {
            for(i = 0; i < this.events.length; i++) {
                if (this.events[i].handler === null) {
                    freeIndex = i
                    break
                }
            }
        }

        eventObj = {
            element,
            event,
            handler,
            selector,
            ns,
            id,
            options
        }

        if (freeIndex === -1) {
            this.events.push(eventObj)
            resultIndex = this.events.length - 1
        } else {
            this.events[freeIndex] = eventObj
            resultIndex = freeIndex
        }

        return resultIndex
    },

    getEventHandler: function(index){
        const events = this.events
        let handler

        if (undef(events[index])) {
            return undefined
        }

        handler = events[index].handler
        events[index] = null
        return handler
    },

    off: function(){
        this.each(this.events, function(){
            this.element.removeEventListener(this.event, this.handler, this.options)
        })
        this.events = []
        return this
    },

    getEvents: function(){
        return this.events
    },

    getEventHooks: function(){
        return this.eventHooks
    },

    addEventHook: function(event, handler, type = "before"){
        this.each(str2array(event), function(){
            this.eventHooks[camelCase(type+"-"+this)] = handler
        })
        return this
    },

    removeEventHook: function(event, type = "before"){
        this.each(str2array(event), (k, v) => {
            delete this.eventHooks[camelCase(type+"-"+v)]
        })
        return this
    },

    removeEventHooks: function(event, type = "before"){
        if (undef(event)) {
            this.eventHooks = {}
        } else {
            this.each(str2array(event), (k, v) => {
                delete this.eventHooks[camelCase(type+"-"+v)]
            })
        }
        return this
    }
})

$.noop = () => {}
$.noop_true = () => true
$.noop_false = () => false

globalThis.query = $

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