(function () {
    'use strict';

    const isArrayLike = obj => {
        return (
            Array.isArray(obj) || (
                typeof obj === "object" &&
                "length" in obj &&
                typeof obj.length === "number" &&
                obj.length >= 0
            )
        )
    };

    const each = (ctx, cb) => {
        let index = 0;
        if (isArrayLike(ctx)) {
            [].forEach.call(ctx, function(val, key) {
                cb.apply(val, [key, val, index++]);
            });
        } else {
            for(let key in ctx) {
                if (ctx.hasOwnProperty(key))
                    cb.apply(ctx[key], [key, ctx[key], index++]);
            }
        }

        return ctx
    };

    const MAX_UID = 1_000_000;

    const uid = prefix => {
        do {
            prefix += Math.floor(Math.random() * MAX_UID);
        } while (document.getElementById(prefix))

        return prefix
    };

    const isPlainObject = obj => {
        let proto;
        if ( !obj || Object.prototype.toString.call( obj ) !== "[object Object]" ) {
            return false
        }
        proto = obj.prototype !== undefined;
        if ( !proto ) {
            return true
        }
        return proto.constructor && typeof proto.constructor === "function"
    };

    const parseHTML = function (data, context) {
        const regexpSingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
        let base, singleTag,
            result = [], ctx, _context;

        if (typeof data !== "string") {
            return []
        }

        data = data.trim();

        ctx = document.implementation.createHTMLDocument("");
        base = ctx.createElement( "base" );
        base.href = document.location.href;
        ctx.head.appendChild( base );
        _context = ctx.body;

        singleTag = regexpSingleTag.exec(data);

        if (singleTag) {
            result.push(document.createElement(singleTag[1]));
        } else {
            _context.innerHTML = data;
            for(let i = 0; i < _context.childNodes.length; i++) {
                result.push(_context.childNodes[i]);
            }
        }

        if (context && isPlainObject(context)) {
            this.each(result,function(){
                const el = this;
                for(let name in context) {
                    if (context.hasOwnProperty(name))
                        el.setAttribute(name, context[name]);
                }
            });
        }

        return result
    };

    const undef = val => {
        return typeof val === "undefined" || val === undefined || val === null;
    };

    const str2array = (str, del = " ") => (""+str).split(del).map(s => (s.trim()));

    const Attr = {
        attr(name, val){
            const attributes = {};

            if (this.length === 0 && arguments.length === 0) {
                return undefined
            }

            if (this.length && arguments.length === 0) {
                each(this[0].attributes, function(){
                    attributes[this.nodeName] = this.nodeValue;
                });
                return attributes
            }

            if (arguments.length === 1) {
                return this.length && this[0].nodeType === 1 && this[0].hasAttribute(name) ? this[0].getAttribute(name) : undefined
            }

            return this.each(function(){
                const el = this;
                if (isPlainObject(name)) {
                    each(name, function(k, v){
                        el.setAttribute(k, v);
                    });
                } else {
                    val ? el.setAttribute(name, val) : el.removeAttribute(name);
                }
            })
        },

        removeAttr: function(name){
            let attributes;

            if (undef(name)) {
                return this.each(function(){
                    const el = this;
                    each(el.attributes, function(){
                        el.removeAttribute(this);
                    });
                })
            }

            attributes = typeof name === "string" ? str2array(name, ",") : name;

            return this.each(function(){
                const el = this;
                each(attributes, function(){
                    if (el.hasAttribute(this)) el.removeAttribute(this);
                });
            })
        },

        toggleAttr: function(name, val){
            return this.each(function(){
                const el = this;

                if (undef(val)) {
                    el.removeAttribute(name);
                } else {
                    el.setAttribute(name, val);
                }
            })
        },

        id: function(val){
            return this.length ? val ? this[0].setAttribute("id", val) : this[0].getAttribute("id") : undefined
        }
    };

    const Class = {
        addClass(){},
        removeClass(){},
        toggleClass(){},

        hasClass(cls){
            let result = false;

            if (!cls || typeof cls !== "string") {
                return false
            }

            this.each((_, el) => {
                each(str2array(cls), (_, c) => {
                    if (!result && el.classList && el.classList.contains(c)) {
                        result = true;
                    }
                });
            });

            return result
        },

        clearClasses(){
            return this.each(function(){
                this.className = "";
            })
        },

        classes(index = 0, asArray = true){
            return this.length === 0 ? undefined : asArray ? str2array(this[0].className) : this[0].className
        },

        removeClassBy(mask){
            return this.each((_, el) => {
                const $el = $(el);
                const classes = $el.classes(0, true);
                $.each(classes, (_, c) => {
                    if (c.includes(mask)) {
                        $el.removeClass(c);
                    }
                });
            })
        }
    };

    const methods = ['add', 'remove', 'toggle'];

    each(methods, (_, m) => {
        Class[`${m}Class`] = function(cls) {
            if (!cls.trim()) return this
            return this.each((_, el)=>{
                const hasClassList = typeof el.classList !== "undefined";
                each(str2array(cls),(_, c) => {
                    console.log(`${m}Class ${c}`);
                    if (hasClassList) el.classList[m](c);
                });
            })
        };
    });

    const defaultOptions = {
        uid: 'uid',
        prevObj: null
    };

    class Query extends Array {
        constructor(selector, context, options) {
            super();

            this.options = Object.assign({}, defaultOptions, options);
            this.length = 0;
            this.uid = uid(this.options.uid);
            this.timestamp = + new Date();
            this.selector = typeof selector === "string" ? selector.trim() : selector;
            this.context = context;
            this.prevObj = this.options.prevObj;

            this.init();
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
                this[0] = window;
                this.length = 1;
                return
            }

            if (this.selector === 'doctype' || (this.selector && this.selector.nodeType && this.selector.nodeType === 10)) {
                this[0] = document.doctype;
                this.length = 1;
                return
            }

            if (this.selector === 'document' || (this.selector && this.selector.nodeType && this.selector.nodeType === 9)) {
                this[0] = document;
                this.length = 1;
                return
            }

            if (isArrayLike(this.selector)) {
                each(this.selector, (key, val) => {
                    this.push(val);
                });
                return
            }

            if (this.selector instanceof HTMLElement) {
                this.push(this.selector);
                return
            }

            if (typeof this.selector === "string") {

                if (this.selector === "#" || this.selector === ".") {
                    console.warn("Selector can't be # or .");
                    return
                }

                const parsed = parseHTML(this.selector, this.context);
                const DOMSelector = parsed.length === 1 && parsed[0].nodeType === 3;

                if (DOMSelector) {
                    if (typeof this.context === "string") {
                        this.context = document.querySelectorAll(this.context);
                    }

                    if (isArrayLike(this.context)) {
                        const r = [], s  = this.selector;
                        this.each(function(){
                            [].push.apply(r, this.querySelectorAll(s));
                        })

                        ;[].push.apply(this, r);
                    } else {
                        [].push.apply(this, document.querySelectorAll(this.selector));
                    }
                } else {
                    [].push.apply(this, parsed);

                    if (this.length > 0 && this.context !== undefined) {
                        if (this.context instanceof Query) {
                            each(this.context, (key, ctx) => {
                                new Query(ctx).append(this);
                            });
                        } else if (this.context instanceof HTMLElement) {
                            new Query(this.context).append(this);
                        }
                    }
                }
            }
        }
    }

    Query.use = (...mixins) => Object.assign(Query.prototype, ...mixins);

    Query.use(Attr, Class);

    const camelCase = str => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

    const $$1 = (s, c, o) => new Query(s, c, o);

    $$1.matches = Element.prototype.matches || Element.prototype["matchesSelector"] || Element.prototype["webkitMatchesSelector"] || Element.prototype["mozMatchesSelector"] || Element.prototype["msMatchesSelector"] || Element.prototype["oMatchesSelector"];
    $$1.html = $$1('html');
    $$1.doctype = $$1("doctype");
    $$1.head = $$1('head');
    $$1.body = $$1('body');
    $$1.document = $$1('document');
    $$1.window = $$1('window');
    $$1.meta = name => !name ? $$1("meta") : $$1("meta[name=$name]".replace("$name", name));
    $$1.metaBy = name => !name ? $$1.meta : $$1("meta[$name]".replace("$name", name));
    $$1.charset = val => {
        if (val) {
            const m = $$1('meta[charset]');
            if (m.length > 0) {
                m.attr('charset', val);
            }
        }
        return document.characterSet
    };

    $$1.each = function(ctx, cb){ return each(ctx, cb) };
    $$1.proxy = (fn, ctx) => typeof fn !== "function" ? undefined : fn.bind(ctx);
    $$1.bind = (fn, ctx) => $$1.proxy(fn, ctx);
    $$1.script = function(el, context = document.body){
        if (typeof el !== "string" || !el instanceof HTMLElement) {
            return
        }
        each(this(el), function(){
            const scr = this;
            if (scr.tagName && scr.tagName === "SCRIPT") {
                const s = document.createElement('script');
                s.type = 'text/javascript';
                if (scr.src) {
                    s.src = scr.src;
                } else {
                    s.textContent = scr.innerText;
                }
                if (!context instanceof HTMLElement) {
                    return
                }
                context.appendChild(s);
                if (scr.parentNode) scr.parentNode.removeChild(scr);
                return s
            }
        });
    };

    $$1.events = [];
    $$1.eventHooks = {};
    $$1.eventUID = -1;

    Object.assign($$1, {
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
                    e.returnValue = fn;
                    return fn
                }, op)
            } else {
                return this(window).on("beforeunload", fn, op)
            }
        },

        setEventHandler: function({element, event, handler, selector, ns, id, options} = args){
            let i, freeIndex = -1, eventObj, resultIndex;
            if (this.events.length > 0) {
                for(i = 0; i < this.events.length; i++) {
                    if (this.events[i].handler === null) {
                        freeIndex = i;
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
            };

            if (freeIndex === -1) {
                this.events.push(eventObj);
                resultIndex = this.events.length - 1;
            } else {
                this.events[freeIndex] = eventObj;
                resultIndex = freeIndex;
            }

            return resultIndex
        },

        getEventHandler: function(index){
            const events = this.events;
            let handler;

            if (undef(events[index])) {
                return undefined
            }

            handler = events[index].handler;
            events[index] = null;
            return handler
        },

        off: function(){
            this.each(this.events, function(){
                this.element.removeEventListener(this.event, this.handler, this.options);
            });
            this.events = [];
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
                this.eventHooks[camelCase(type+"-"+this)] = handler;
            });
            return this
        },

        removeEventHook: function(event, type = "before"){
            this.each(str2array(event), (k, v) => {
                delete this.eventHooks[camelCase(type+"-"+v)];
            });
            return this
        },

        removeEventHooks: function(event, type = "before"){
            if (undef(event)) {
                this.eventHooks = {};
            } else {
                this.each(str2array(event), (k, v) => {
                    delete this.eventHooks[camelCase(type+"-"+v)];
                });
            }
            return this
        }
    });

    $$1.noop = () => {};
    $$1.noop_true = () => true;
    $$1.noop_false = () => false;

    globalThis.query = $$1;

    let _$ = globalThis.$;

    $$1.global = () => {
        _$ = globalThis.$;
        globalThis.$ = $$1;
    };

    $$1.noConflict = () => {
        if ( globalThis.$ === $$1 ) {
            globalThis.$ = _$;
        }
        return $$1
    };

    globalThis.$ = $$1;

})();
