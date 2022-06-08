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
        containsClass(){},
        itemClass(){},

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
            return this.length === 0 ? undefined : asArray ? str2array(this[index].className) : this[index].className
        },

        classesCount(index = 0){
            return this.length === 0 ? undefined : this[index].classList.length
        },

        removeClassBy(mask){
            return this.each((_, el) => {
                $.each(str2array(el.className), (_, c) => {
                    if (c.includes(mask)) {
                        el.classList.remove(c);
                    }
                });
            })
        }
    };

    const methods = ['add', 'remove', 'toggle', 'contains', 'item'];

    each(methods, (_, m) => {
        Class[`${m}Class`] = function(cls) {
            if (!cls.trim()) return this
            return this.each((_, el)=>{
                const hasClassList = typeof el.classList !== "undefined";
                each(str2array(cls),(_, c) => {
                    if (hasClassList) el.classList[m](c);
                });
            })
        };
    });

    const isVisible = (elem) => !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );

    const Contains = {
        index(sel, global = false){
            let el, _index = -1;

            if (this.length === 0) {
                return _index
            }

            if (undef(sel)) {
                el = this[0];
            } else if (isArrayLike(sel)) {
                el = sel[0];
            } else if (typeof sel === "string") {
                el = $(sel)[0];
            } else {
                el = undefined;
            }

            if (undef(el)) {
                return _index
            }

            if (global) {
                if (el && el.parentNode) each(el.parentNode.children, function(i){
                    if (this === el) {
                        _index = i;
                    }
                });
            } else {
                this.each(function(i){
                    if (this === el) {
                        _index = i;
                    }
                });
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
            let result = false;

            if (this.length === 0) {
                return false
            }

            if (isArrayLike(s)) {
                this.each(function(){
                    const el = this;
                    each(s, function(){
                        const sel = this;
                        if (el === sel) {
                            result = true;
                        }
                    });
                });
            } else

            if (s === ":selected") {
                this.each(function(){
                    if (!result && this.selected) result = true;
                });
            } else

            if (s === ":checked") {
                this.each(function(){
                    if (!result && this.checked) result = true;
                });
            } else

            if (s === ":visible") {
                this.each(function(){
                    if (!result && isVisible(this)) result = true;
                });
            } else

            if (s === ":hidden") {
                this.each(function(){
                    const styles = getComputedStyle(this);
                    if (
                        this.getAttribute('type') === 'hidden'
                        || this.hidden
                        || styles['display'] === 'none'
                        || styles['visibility'] === 'hidden'
                        || parseInt(styles['opacity']) === 0
                    ) result = true;
                });
            } else

            if (typeof  s === "string") {
                this.each(function(){
                    if ($.matches.call(this, s)) {
                        result = true;
                    }
                });
            } else

            if (s.nodeType && s.nodeType === 1) {
                this.each(function(){
                    if  (this === s) {
                        result = true;
                    }
                });
            }

            return result
        },

        same(o){
            let result = true;
            const _o = $(o);

            if (this.length !== _o.length) return false

            for (let i = 0; i < _o.length; i++) {
                if (_o[i] !== this[i]) {
                    result = false;
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
                let sel = fn;
                fn = el => $.matches.call(el, sel);
            }

            return $([].filter.call(this, fn), undefined,{prevObj: this})
        },

        odd(s){
            let result = this.filter((_, i) => i % 2 === 0);

            if (s) {
                result = result.filter(el => $.matches.call(el, s));
            }

            return $(result, undefined, {prevObj: this})
        },

        even(s){
            let result = this.filter((_, i) => i % 2 !== 0);

            if (s) {
                result = result.filter((el) => $.matches.call(el, s));
            }

            return $(result, undefined,{prevObj: this})
        },

        find(s){
            let res = [], result;

            if (this.length === 0) {
                result = this; // maybe need return undefined ???
            } else {
                this.each(function () {
                    const el = this;
                    if (typeof el.querySelectorAll !== "undefined")
                        res = res.concat([].slice.call(el.querySelectorAll(s)));
                });
                result = $(res);
            }

            return $(result, undefined,{prevObj: this})
        },

        contains(s){
            return this.find(s).length > 0
        },

        children(s){
            let i, res = [];

            this.each(function(){
                const el = this;
                for(i = 0; i < el.children.length; i++) {
                    if (el.children[i].nodeType === 1)
                        res.push(el.children[i]);
                }
            });

            res = s ? res.filter(el => $.matches.call(el, s)) : res;

            return $(res, undefined,{prevObj: this})
        },

        parent(s){
            let res = [];
            if (this.length === 0) {
                return
            }

            this.each(function(){
                if (this.parentNode) {
                    if (!res.includes(this.parentNode))
                        res.push(this.parentNode);
                }
            });

            res = s ? res.filter(el => $.matches.call(el, s)) : res;

            return $(res, undefined,{prevObj: this})
        },

        parents(s){
            let res = [];

            if (this.length === 0) {
                return
            }

            this.each(function(){
                let par = this.parentNode;
                while (par) {
                    if (par.nodeType === 1 && !res.includes(par)) {
                        if (s) {
                            if ($.matches.call(par, s)) {
                                res.push(par);
                            }
                        } else {
                            res.push(par);
                        }
                    }
                    par = par.parentNode;
                }
            });

            return $(res, undefined,{prevObj: this})
        },

        siblings(s){
            let res = [];

            if (this.length === 0) {
                return
            }

            this.each(function(){
                const el = this;
                if (el.parentNode) {
                    each(el.parentNode.children, function(){
                        if (el !== this) res.push(this);
                    });
                }
            });

            if (s) {
                res = res.filter(el => $.matches.call(el, s));
            }

            return $(res, undefined,{prevObj: this})
        },

        _siblingAll(dir, s){
            let res = [];

            if (this.length === 0) {
                return
            }

            this.each(function(){
                let el = this;
                while (el) {
                    el = el[dir];
                    if (!el) break
                    res.push(el);
                }
            });

            if (s) {
                res = res.filter(el => $.matches.call(el, s));
            }

            return $(res, undefined,{prevObj: this})
        },

        _sibling(dir, s){
            let res = [];

            if (this.length === 0) {
                return
            }

            this.each(function(){
                const el = this[dir];
                if (el && el.nodeType === 1) {
                    res.push(el);
                }
            });

            if (s) {
                res = res.filter(el => $.matches.call(el, s));
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
            const res = [];

            if (this.length === 0) {
                return
            }

            if (!s) {
                return this.parent(s)
            }

            this.each(function(){
                let el = this;
                while (el) {
                    if (!el) break
                    if ($.matches.call(el, s)) {
                        res.push(el);
                        return
                    }
                    el = el.parentElement;
                }
            });

            return $(res.reverse(), undefined,{prevObj: this})
        },

        has(s){
            const res = [];

            if (this.length === 0) {
                return
            }

            this.each(function(){
                const el = this;
                const child = $(el).children(s);
                if (child.length > 0) {
                    res.push(this);
                }
            });

            return $(res, undefined,{prevObj: this})
        },

        back(to_start = false){
            let ret;
            if (to_start) {
                ret = this.prevObj;
                while (ret) {
                    if (!ret.prevObj) break
                    ret = ret.prevObj;
                }
            } else {
                ret = this.prevObj ? this.prevObj : this;
            }
            return ret
        }
    };

    const Scroll = {
        scrollTop: function(val){
            if (undef(val)) {
                return this.length === 0 ? undefined : this[0] === window ? scrollY : this[0].scrollTop
            }

            return this.each(function(){
                this.scrollTop = val;
            })
        },

        scrollLeft: function(val){
            if (undef(val)) {
                return this.length === 0 ? undefined : this[0] === window ? scrollX : this[0].scrollLeft
            }

            return this.each(function(){
                this.scrollLeft = val;
            })
        }
    };

    const camelCase = str => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

    const Css = {
        _setStyleProp(el, key, val){
            key = camelCase(key);

            if (["scrollLeft", "scrollTop"].includes(key)) {
                el[key] = (parseInt(val));
            } else {
                el.style[key] = isNaN(val) || ['opacity', 'zIndex'].includes(key) ? val : val + 'px';
            }
        },

        _getStyle(el, prop, pseudo){
            return ["scrollLeft", "scrollTop"].includes(prop) ? $(el)[prop]() : getComputedStyle(el, pseudo)[prop]
        },

        style: function(name, pseudo){
            let el;
            const that = this;

            if (typeof name === 'string' && this.length === 0) {
                return undefined
            }

            if (this.length === 0) {
                return this
            }

            el = this[0];

            if (undef(name) || name === "all") {
                return getComputedStyle(el, pseudo)
            } else {
                const result = {}, names = name.split(", ").map(function(el){
                    return (""+el).trim()
                });

                if (names.length === 1)  {
                    return this._getStyle(el, names[0], pseudo)
                } else {
                    each(names, function () {
                        const prop = this;
                        result[prop] = that._getStyle(el, prop, pseudo);
                    });
                    return result
                }
            }
        },

        removeStyle: function(name){
            if (undef(name) || this.length === 0) return this

            const names = str2array(name);

            return this.each(function(){
                const el = this;
                each(names, function(){
                    el.style.removeProperty(this);
                });
            })
        },

        css: function(key, val){
            const that = this;

            key = key || 'all';

            if (typeof key === "string" && !val) {
                return  this.style(key)
            }

            return this.each(function(){
                const el = this;
                if (typeof key === "object") {
                    each(key, function(key, val){
                        that._setStyleProp(el, key, val);
                    });
                } else if (typeof key === "string") {
                    that._setStyleProp(el, key, val);
                }
            })
        }
    };

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

    Query.use(Attr, Class, Contains, Css, Scroll);

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
