import {undef} from "../helpers/undef.js"
import {str2array} from "../helpers/str-to-array.js"
import {camelCase} from "../helpers/camel-case.js"
import {isEmptyObject} from "../helpers/is-empty-object.js"
import {isPlainObject} from "../helpers/is-plain-object.js"
import {each} from "../helpers/each.js"
import {matches} from "../helpers/matches.js"

const normalizeEventName = name => typeof name !== "string" ? undefined : name.replace(/\-/g, "").toLowerCase()

const overriddenStop =  Event.prototype.stopPropagation
const overriddenPrevent =  Event.prototype.preventDefault

Event.prototype.stopPropagation = function(){
    this.isPropagationStopped = true
    overriddenStop.apply(this, arguments)
}

Event.prototype.preventDefault = function(){
    this.isPreventedDefault = true
    overriddenPrevent.apply(this, arguments)
}

Event.prototype.stop = function(immediate){
    return immediate ? this.stopImmediatePropagation() : this.stopPropagation()
}

export const DollarEvents = {
    events: [],
    eventHooks: {},
    eventUID: -1,

    ready(fn, op = false){
        return $(fn, op)
    },

    load(fn, op = false){
        return $(window).on("load", fn, op)
    },

    unload(fn, op = false){
        return $(window).on("unload", fn, op)
    },

    beforeunload(fn, op = false){
        if (typeof fn === "string") {
            return $(window).on("beforeunload", function(e){
                e.returnValue = fn
                return fn
            }, op)
        } else {
            return $(window).on("beforeunload", fn, op)
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
}

export const Events = {
    load: function(fn, op){
        return (this.length === 0 || this[0]['self'] !== window) ? undefined : DollarEvents.load(fn, op)
    },

    unload: function(fn, op){
        return (this.length === 0 || this[0]['self'] !== window) ? undefined : DollarEvents.unload(fn, op)
    },

    beforeunload: function(fn, op){
        return (this.length === 0 || this[0]['self'] !== window) ? undefined : DollarEvents.beforeunload(fn, op)
    },

    ready: function(fn, op){
        if (this.length && this[0] === document && typeof fn === 'function') {
            return DollarEvents.ready(fn, op)
        }
    },

    on: function(eventsList, sel, handler, options){
        if (this.length === 0) {
            return 
        }

        if (typeof sel === 'function') {
            options = handler
            handler = sel
            sel = undefined
        }

        if (!isPlainObject(options)) {
            options = {}
        }

        return this.each(function(){
            const el = this
            each(str2array(eventsList), function(){
                let h, index, originEvent
                const ev = this, event = ev.split("."), name = normalizeEventName(event[0]), ns = options.ns ? options.ns : event[1]

                DollarEvents.eventUID++

                h = function(e){
                    let target = e.target
                    const beforeHook = DollarEvents.eventHooks[camelCase("before-"+name)]
                    const afterHook = DollarEvents.eventHooks[camelCase("after-"+name)]

                    if (typeof beforeHook === "function") {
                        beforeHook.call(target, e)
                    }

                    if (!sel) {
                        handler.call(el, e)
                    } else {
                        while (target && target !== el) {
                            if (matches.call(target, sel)) {
                                handler.call(target, e)
                                if (e.isPropagationStopped) {
                                    e.stopImmediatePropagation()
                                    break
                                }
                            }
                            target = target.parentNode
                        }
                    }

                    if (typeof afterHook === "function") {
                        afterHook.call(target, e)
                    }

                    if (options.once) {
                        index = +$(el).data( "event-"+e.type+(sel ? ":"+sel:"")+(ns ? ":"+ns:"") )
                        if (!isNaN(index)) DollarEvents.events.splice(index, 1)
                    }
                }

                Object.defineProperty(h, "name", {
                    value: handler.name && handler.name !== "" ? handler.name : "func_event_"+name+"_"+DollarEvents.eventUID
                })

                originEvent = name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"")

                el.addEventListener(name, h, !isEmptyObject(options) ? options : false)

                index = DollarEvents.setEventHandler({
                    el: el,
                    event: name,
                    handler: h,
                    selector: sel,
                    ns: ns,
                    id: DollarEvents.eventUID,
                    options: !isEmptyObject(options) ? options : false
                })
                $(el).data('event-'+originEvent, index)
            })
        })
    },

    one: function(events, sel, handler, options){
        if (!isPlainObject(options)) {
            options = {}
        }

        options.once = true

        return this["on"].apply(this, [events, sel, handler, options])
    },

    off: function(eventsList, sel, options){

        if (isPlainObject(sel)) {
            options = sel
            sel = null
        }

        if (!isPlainObject(options)) {
            options = {}
        }

        if (!eventsList || eventsList.toLowerCase() === 'all') {
            return this.each(function(){
                const el = this
                each(DollarEvents.events, function(){
                    const e = this
                    if (e.element === el) {
                        el.removeEventListener(e.event, e.handler, e.options)
                        e.handler = null
                        $(el).data("event-"+name+(e.selector ? ":"+e.selector:"")+(e.ns ? ":"+e.ns:""), null)
                    }
                })
            })
        }

        return this.each(function(){
            const el = this
            each(str2array(eventsList), function(){
                const evMap = this.split("."),
                    name = normalizeEventName(evMap[0]),
                    ns = options.ns ? options.ns : evMap[1]
                let originEvent, index

                originEvent = "event-"+name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"")
                index = +$(el).data(originEvent)

                if (index !== undefined && DollarEvents.events[index].handler) {
                    el.removeEventListener(name, DollarEvents.events[index].handler, DollarEvents.events[index].options)
                    DollarEvents.events[index].handler = null
                }

                $(el).data(originEvent, null)
            })
        })
    },

    trigger: function(name, data){
        return this.fire(name, data)
    },

    fire: function(name, data){
        const _name = normalizeEventName(name)

        if (this.length === 0) {
            return 
        }

        if (['focus', 'blur'].indexOf(_name) > -1) {
            this[0][_name]()
            return this
        }

        const e = new CustomEvent(_name, {
            bubbles: true,
            cancelable: true,
            detail: data
        })

        return this.each(function(){
            this.dispatchEvent(e)
        })
    },

    hover: function( fnOver, fnOut, options ) {
        return this.on("mouseenter", fnOver, options ).on("mouseleave", fnOut || fnOver, options )
    }
}

const eventMap = [
    "blur", "focus", "resize", "scroll",
    "click", "dblclick",
    "mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover",
    "touchstart", "touchend", "touchmove", "touchcancel",
    "change", "select", "submit",
    "keyup", "keydown", "keypress",
    "contextmenu"
]

eventMap.forEach(function( name ) {
    Events[ name ] = function( sel, fn, opt ) {
        return arguments.length > 0 ?
            this.on( name, sel, fn, opt ) :
            this.fire( name, opt.detail )
    }
})