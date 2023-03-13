(function () {
    'use strict';

    const isArrayLike = obj => obj && (Array.isArray(obj) || typeof obj.length === "number");

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

    const matches = Element.prototype.matches || Element.prototype["matchesSelector"] || Element.prototype["webkitMatchesSelector"] || Element.prototype["mozMatchesSelector"] || Element.prototype["msMatchesSelector"] || Element.prototype["oMatchesSelector"];

    const isLocalhost = host => {
        const hostname = host || globalThis.location.hostname;
        return (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "[::1]" ||
            hostname === "" ||
            hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) !== null
        )
    };

    const isTouchable = () => (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator["msMaxTouchPoints"] > 0));

    const exec = (fn, args, context) => {
        let func;

        if (typeof fn === "function") {
            func = fn;
        } else
        if (/^[a-z]+[\w.]*[\w]$/i.test(fn)) {
            const ns = fn.split(".");
            func = globalThis;

            for(let i = 0; i < ns.length; i++) {
                func = func[ns[i]];
            }
        } else {
            func = new Function("a", fn);
        }

        return func.apply(context, args)
    };

    const isPrivateAddress = (loc = globalThis.location.hostname) => /(^localhost)|(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2\d\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test( loc );

    const isVisible = (elem) => !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );

    const isHidden = elem => {
        const s = getComputedStyle(elem);
        return !isVisible(elem) || +s['opacity'] === 0 || elem.hidden || s['visibility'] === "hidden";
    };

    const inViewport = el => {
        const rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
    };

    // Shoutout AngusCroll (https://goo.gl/pxwQGp)

    const toType = obj => ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();

    const queryCheck = s => document.createDocumentFragment().querySelector(s);

    const isSelector = selector => {
        try {
            queryCheck(selector);
            return true;
        } catch {
            return false
        }
    };

    const nvl = (val, ifNullValue) => (val === null || typeof val === 'undefined') ? ifNullValue : val;

    const iif = (cond, trueVal, falseVal) => cond ? trueVal : falseVal;

    const undef = val => {
        return typeof val === "undefined" || val === undefined || val === null;
    };

    function coalesce () {
        const args = [...arguments];
        for(let arg of args) {
            if (!undef(arg)) return arg
        }
        return null
    }

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

        hasAttr(name){
            return !!this.attr(name)
        },

        hasAttrs(names){
            let result = true;
            for(let name of names) {
                if (typeof this.attr(name) === 'undefined') {
                    return false
                }
            }
            return result
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
                each(str2array(el.className), (_, c) => {
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

    const Contains = {
        index(sel, global = true){
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
                    if (matches.call(this, s)) {
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

        in(/*Query*/ set){
            let inSet = false;
            this.each(function(){
                if (!inSet && set.is(this)) inSet = true;
            });
            return inSet
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
                fn = el => matches.call(el, sel);
            }

            return $([].filter.call(this, fn), undefined,{prevObj: this})
        },

        odd(s){
            let result = this.filter((_, i) => i % 2 === 0);

            if (s) {
                result = result.filter(el => matches.call(el, s));
            }

            return $(result, undefined, {prevObj: this})
        },

        even(s){
            let result = this.filter((_, i) => i % 2 !== 0);

            if (s) {
                result = result.filter((el) => matches.call(el, s));
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

            res = s ? res.filter(el => matches.call(el, s)) : res;

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

            res = s ? res.filter(el => matches.call(el, s)) : res;

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
                            if (matches.call(par, s)) {
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
                res = res.filter(el => matches.call(el, s));
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
                res = res.filter(el => matches.call(el, s));
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
                res = res.filter(el => matches.call(el, s));
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
                    if (matches.call(el, s)) {
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
                const result = {}, names = str2array(name, ",");

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

    const isEmptyObject = obj => {
        if (typeof obj !== "object" || obj === null) {
            return undefined;
        }
        for (let name in obj ) {
            if (obj.hasOwnProperty(name)) return false;
        }
        return true;
    };

    const normalizeEventName = name => typeof name !== "string" ? undefined : name.replace(/\-/g, "").toLowerCase();

    const overriddenStop =  Event.prototype.stopPropagation;
    const overriddenPrevent =  Event.prototype.preventDefault;

    Event.prototype.stopPropagation = function(){
        this.isPropagationStopped = true;
        overriddenStop.apply(this, arguments);
    };

    Event.prototype.preventDefault = function(){
        this.isPreventedDefault = true;
        overriddenPrevent.apply(this, arguments);
    };

    Event.prototype.stop = function(immediate){
        return immediate ? this.stopImmediatePropagation() : this.stopPropagation()
    };

    const DollarEvents = {
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
                    e.returnValue = fn;
                    return fn
                }, op)
            } else {
                return $(window).on("beforeunload", fn, op)
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
    };

    const Events = {
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
                options = handler;
                handler = sel;
                sel = undefined;
            }

            if (!isPlainObject(options)) {
                options = {};
            }

            return this.each(function(){
                const el = this;
                each(str2array(eventsList), function(){
                    let h, index, originEvent;
                    const ev = this, event = ev.split("."), name = normalizeEventName(event[0]), ns = options.ns ? options.ns : event[1];

                    DollarEvents.eventUID++;

                    h = function(e){
                        let target = e.target;
                        const beforeHook = DollarEvents.eventHooks[camelCase("before-"+name)];
                        const afterHook = DollarEvents.eventHooks[camelCase("after-"+name)];

                        if (typeof beforeHook === "function") {
                            beforeHook.call(target, e);
                        }

                        if (!sel) {
                            handler.call(el, e);
                        } else {
                            while (target && target !== el) {
                                if (matches.call(target, sel)) {
                                    handler.call(target, e);
                                    if (e.isPropagationStopped) {
                                        e.stopImmediatePropagation();
                                        break
                                    }
                                }
                                target = target.parentNode;
                            }
                        }

                        if (typeof afterHook === "function") {
                            afterHook.call(target, e);
                        }

                        if (options.once) {
                            index = +$(el).data( "event-"+e.type+(sel ? ":"+sel:"")+(ns ? ":"+ns:"") );
                            if (!isNaN(index)) DollarEvents.events.splice(index, 1);
                        }
                    };

                    Object.defineProperty(h, "name", {
                        value: handler.name && handler.name !== "" ? handler.name : "func_event_"+name+"_"+DollarEvents.eventUID
                    });

                    originEvent = name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"");

                    el.addEventListener(name, h, !isEmptyObject(options) ? options : false);

                    index = DollarEvents.setEventHandler({
                        el: el,
                        event: name,
                        handler: h,
                        selector: sel,
                        ns: ns,
                        id: DollarEvents.eventUID,
                        options: !isEmptyObject(options) ? options : false
                    });
                    $(el).data('event-'+originEvent, index);
                });
            })
        },

        one: function(events, sel, handler, options){
            if (!isPlainObject(options)) {
                options = {};
            }

            options.once = true;

            return this["on"].apply(this, [events, sel, handler, options])
        },

        off: function(eventsList, sel, options){

            if (isPlainObject(sel)) {
                options = sel;
                sel = null;
            }

            if (!isPlainObject(options)) {
                options = {};
            }

            if (!eventsList || eventsList.toLowerCase() === 'all') {
                return this.each(function(){
                    const el = this;
                    each(DollarEvents.events, function(){
                        const e = this;
                        if (e.element === el) {
                            el.removeEventListener(e.event, e.handler, e.options);
                            e.handler = null;
                            $(el).data("event-"+name+(e.selector ? ":"+e.selector:"")+(e.ns ? ":"+e.ns:""), null);
                        }
                    });
                })
            }

            return this.each(function(){
                const el = this;
                each(str2array(eventsList), function(){
                    const evMap = this.split("."),
                        name = normalizeEventName(evMap[0]),
                        ns = options.ns ? options.ns : evMap[1];
                    let originEvent, index;

                    originEvent = "event-"+name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"");
                    index = +$(el).data(originEvent);

                    if (index !== undefined && DollarEvents.events[index].handler) {
                        el.removeEventListener(name, DollarEvents.events[index].handler, DollarEvents.events[index].options);
                        DollarEvents.events[index].handler = null;
                    }

                    $(el).data(originEvent, null);
                });
            })
        },

        trigger: function(name, data){
            return this.fire(name, data)
        },

        fire: function(name, data){
            const _name = normalizeEventName(name);

            if (this.length === 0) {
                return 
            }

            if (['focus', 'blur'].indexOf(_name) > -1) {
                this[0][_name]();
                return this
            }

            const e = new CustomEvent(_name, {
                bubbles: true,
                cancelable: true,
                detail: data
            });

            return this.each(function(){

                this.dispatchEvent(e);
            })
        },

        hover: function( fnOver, fnOut, options ) {
            return this.on("mouseenter", fnOver, options ).on("mouseleave", fnOut || fnOver, options )
        }
    };

    const eventMap = [
        "blur", "focus", "resize", "scroll",
        "click", "dblclick",
        "mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover",
        "touchstart", "touchend", "touchmove", "touchcancel",
        "change", "select", "submit",
        "keyup", "keydown", "keypress",
        "contextmenu"
    ];

    eventMap.forEach(function( name ) {
        Events[ name ] = function( sel, fn, opt ) {
            return arguments.length > 0 ?
                this.on( name, sel, fn, opt ) :
                this.fire( name, opt.detail )
        };
    });

    class DataSet {
        constructor() {
            this._dataset = new Map();
        }

        set(element, key, data){
            if (!this._dataset.has(element)) {
                this._dataset.set(element, new Map());
            }

            const instanceMap = this._dataset.get(element);

            // TODO check this
            if (!instanceMap.has(key) && instanceMap.size !== 0) {
                //console.error(`Query doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`)
                return
            }

            instanceMap.set(key, data);
        }

        get(element, key, defaultValue = null){
            if (this._dataset.has(element)) {
                const elementData = this._dataset.get(element);
                return key ? elementData.get(key) || defaultValue : elementData
            }

            return null
        }

        remove(element, key){
            if (!this._dataset.has(element)) {
                return
            }

            const instanceMap = this._dataset.get(element);

            instanceMap.delete(key);

            if (instanceMap.size === 0) {
                this._dataset.delete(element);
            }
        }

        removeAll(element){
            if (!this._dataset.has(element)) {
                return
            }
            this._dataset.delete(element);
        }

        attr(elem, key, data){
            if (elem.nodeType !== 1 || !key) {
                return undefined
            }

            const attrName = "data-" + key.replace(/[A-Z]/g, "-$&").toLowerCase();

            if ( data ) {
                elem.setAttribute(attrName, JSON.stringify( data ));
            }

            return elem.getAttribute(attrName);
        }
    }

    const appendScript = (el, context = document.body) => {
        if (!context instanceof HTMLElement) {
            return
        }

        const elements = $(el);

        each(elements, (_, scr) => {
            if (scr.tagName && scr.tagName === "SCRIPT") {
                const s = document.createElement('script');
                s.type = 'text/javascript';
                if (scr.src) {
                    s.src = scr.src;
                } else {
                    s.textContent = scr.innerText;
                }
                context.appendChild(s);
                if (scr.parentNode)
                    scr.parentNode.removeChild(scr);
                return s
            }
        });
    };

    const Script = {
        script(context){
            appendScript(this, context);
            return this
        }
    };

    const parseHTML = function (html) {
        const regexpSingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
        let base, singleTag, result = [], doc;

        if (typeof html !== "string") {
            return []
        }

        doc = document.implementation.createHTMLDocument("");
        base = doc.createElement( "base" );
        base.href = document.location.href;
        doc.head.appendChild( base );

        singleTag = regexpSingleTag.exec(html);

        if (singleTag) {
            result.push(document.createElement(singleTag[1]));
        } else {
            doc.body.innerHTML = html;
            for(let i = 0; i < doc.body.childNodes.length; i++) {
                result.push(doc.body.childNodes[i]);
            }
        }

        return result
    };

    const args$1 = function() {
        let elements = [], _args = [...arguments];

        for (let arg of _args) {
            elements = [].concat(elements, normalizeElements(arg));
        }

        return elements
    };

    const normalizeElements = function(s){
        let result = undefined;

        if (typeof s === "string")
            result = isSelector(s) ? $(s) : parseHTML(s);
        else if (s.nodeType && s.nodeType === 1)
            result = [s];
        else if (isArrayLike(s))
            result = s;

        return result
    };

    const Manipulations = {
        appendText(text){
            return this.each((_, el) => el.innerHTML += text)
        },

        prependText(text){
            return this.each((_, el) => el.innerHTML = text + el.innerHTML);
        },

        append(){
            let elements = args$1(...arguments);

            return this.each( (index, el) => {
                each(elements, (_, ch) => {
                    if (el === ch) return
                    const child = index === 0 ? ch : ch.cloneNode(true);
                    if (child.tagName && child.tagName !== "SCRIPT") el.append(child);
                    appendScript(child);
                });
            })
        },

        appendTo(){
            let elements = args$1(...arguments);

            return this.each((index, el) => {
                each(elements, (parIndex, parent) => {
                    if (el === parent) return
                    $(parent).append(parIndex === 0 ? el : el.cloneNode(true));
                });
            })
        },

        prepend(){
            let elements = args$1(...arguments);

            return this.each( (elIndex, el) => {
                each(elements, (_, ch) => {
                    if (el === ch) return
                    const child = elIndex === 0 ? ch : ch.cloneNode(true);
                    if (child.tagName && child.tagName !== "SCRIPT") el.prepend(child);
                    appendScript(child);
                });
            })
        },

        prependTo(){
            let elements = args$1(...arguments);

            return this.each((index, el) => {
                each(elements, (parIndex, parent) => {
                    if (el === parent) return
                    $(parent).prepend(parIndex === 0 ? el : el.cloneNode(true));
                });
            })
        },

        insertBefore(){
            let elements = args$1(...arguments);

            return this.each((index, el) => {
                each(elements, (elIndex, ch) => {
                    if (el === ch) return
                    if (ch.parentNode) {
                        ch.parentNode.insertBefore(elIndex === 0 ? el : el.cloneNode(true), ch);
                    }
                });
            })
        },

        insertAfter(){
            let elements = args$1(...arguments);

            return this.each((index, el) => {
                each(elements, (elIndex, ch) => {
                    if (el === ch) return
                    if (ch.parentNode) {
                        ch.parentNode.insertBefore(elIndex === 0 ? el : el.cloneNode(true), ch.nextSibling);
                    }
                });
            })
        },

        after(html){
            return this.each(function(){
                const el = this;
                if (typeof html === "string") {
                    el.insertAdjacentHTML('afterend', html);
                } else {
                    $(html).insertAfter(el);
                }
            })
        },

        before(html){
            return this.each(function(){
                const el = this;
                if (typeof html === "string") {
                    el.insertAdjacentHTML('beforebegin', html);
                } else {
                    $(html).insertBefore(el);
                }
            })
        },

        clone(deep = false, withData = false){
            const res = [];
            this.each((_, el) => {
                const clone = $(el.cloneNode(deep));
                if (withData) {
                    const data = $.dataset.get(el);
                    each(data, function(k, v){
                        $.dataset.set(clone, k, v);
                    });
                }
                res.push(clone);
            });

            return $(res)
        },

        import(deep = false){
            const res = [];
            this.each((_, el) => res.push(document.importNode(el, deep)));
            return $(res)
        },

        adopt(){
            const res = [];
            this.each((_, el) => res.push(document.adoptNode(el)));
            return $(res)
        },

        remove(selector){
            let i = 0, node, out;
            const res = [];

            if (this.length === 0) {
                return this
            }

            out = selector ? this.filter((el) => $.matches.call(el, selector)) : this;

            for ( ; ( node = out[ i ] ) != null; i++ ) {
                if (node.parentNode) {
                    res.push(node.parentNode.removeChild(node));
                    $.dataset.removeAll(node);
                }
            }

            return $(res)
        },

        clear(){
            return this.each((_, el)=>el.innerHTML = '')
        },

        wrap(el){
            const wrapper = $(normalizeElements(el));
            const res = [];

            if (!this.length || !wrapper.length) {
                return
            }

            this.each((_, el) => {
                let _wrapper = wrapper.clone(true, true);
                _wrapper.insertBefore(el);
                let _target = _wrapper;
                while (_target.children().length) {
                    _target = _target.children().eq(0);
                }
                _target.append(el);
                res.push(_wrapper);
            });

            return $(res)
        },

        wrapAll( el ){
            const wrapper = $(normalizeElements(el));
            let _wrapper, _target;

            if (!this.length || !wrapper.length) {
                return
            }

            _wrapper = wrapper.clone(true, true);
            _wrapper.insertBefore(this[0]);

            _target = _wrapper;
            while (_target.children().length) {
                _target = _target.children().eq(0);
            }

            this.each(function(){
                _target.append(this);
            });

            return _wrapper;
        },

        wrapInner: function( el ){
            if (this.length === 0) {
                return ;
            }

            var wrapper = $(normalizeElements(el));

            if (!wrapper.length) {
                return ;
            }

            var res = [];

            this.each(function(){
                var elem = $(this);
                var html = elem.html();
                var wrp = wrapper.clone(true, true);
                elem.html(wrp.html(html));
                res.push(wrp);
            });

            return $(res);
        }
    };

    const Utils = {
        toArray: function(){
            return [...this]
        },
        age(){
            return this.timestamp
        },
        each(cb){
            return each(this, cb)
        },
    };

    const Visibility = {
        inViewport(){
            return this.length ? inViewport(this[0]) : undefined
        },

        isVisible(){
            return this.length ? isVisible(this[0]) : undefined
        },

        isHidden(){
            return this.length ? isHidden(this[0]) : undefined
        },

        hide(cb){
            return this.each((_, el) => {
                getComputedStyle(el, null)['display'];
                $(el).data('display-state', el.style.display);
                el.style.display = 'none';
                if (typeof cb === "function") {
                    cb.apply(el, [el]);
                }
            })
        },

        show(cb){
            return this.each((_, el) => {
                const display = $(el).data('display-state');
                el.style.display = display ? display === 'none' ? 'block' : display : '';
                if (parseInt(el.style.opacity) === 0) {
                    el.style.opacity = "1";
                }
                if (typeof cb === "function") {
                    cb.apply(el, [el]);
                }
            })
        },

        visible(mode = true, cb){
            return this.each((_, el) => {
                el.style.visibility = mode ? 'visible' : 'hidden';
                if (typeof cb === "function") {
                    cb.apply(el, [el]);
                }
            })
        },

        toggle(cb){
            return this.each((_, el) => {
                let func = "show";
                if ( getComputedStyle(el, null)['display'] !== 'none') {
                    func = 'hide';
                }
                $(el)[func](cb);
            })
        },

        hidden(mode = true, cb){
            if (typeof mode !== "boolean") {
                mode = false;
            }
            return this.each( (_, el) => {
                el.hidden = mode;
                if (typeof cb === "function") {
                    cb.apply(el, [el]);
                }
            })
        }
    };

    const Props = {
        _prop(prop, value = ''){
            if (arguments.length === 1) {
                return this.length === 0 ? undefined : this[0][prop]
            }

            return this.each((_, el) => {
                if (typeof el[prop] !== "undefined")
                    el[prop] = value;
            })
        },

        prop(prop, value){
            return arguments.length === 1 ?
                this._prop(prop) :
                this._prop(prop, typeof value === "undefined" ? "" : value)
        },

        val(value){
            if (undef(value)) {
                return !this.length ? undefined : this[0].value
            }

            return this.each((_, el) => {
                if (typeof el.value !== "undefined") {
                    el.value = value;
                } else {
                    el.innerHTML = value;
                }
            })
        },

        html(value){
            const that = this, v = [];
            if (arguments.length === 0) {
                return this._prop('innerHTML');
            }
            if (typeof value !== 'string' && isArrayLike(value)) {
                each(value, (_, el) => {
                    if (el instanceof HTMLElement)
                        v.push(this.outerHTML);
                });
            } else {
                v.push(value);
            }
            that._prop('innerHTML', v.join("\n"));
            return this
        },

        outerHTML(){
            return this._prop('outerHTML');
        },

        text(value){
            return arguments.length === 0 ?
                this._prop('textContent') :
                this._prop('textContent', typeof value === "undefined" ? "" : value);
        },

        innerText(value){
            return arguments.length === 0 ?
                this._prop('innerText') :
                this._prop('innerText', typeof value === "undefined" ? "" : value);
        },

        empty(){
            return this.each((_, el) => {
                if (typeof el.value !== "undefined") {
                    el.value = "";
                } else if (typeof el.innerHTML !== "undefined") {
                    el.innerHTML = "";
                }
            })
        }
    };

    const Size = {
        _size: function(prop, val){
            if (this.length === 0) return

            if (undef(val)) {
                const el = this[0];
                if (prop === 'height') {
                    return el === window ? window.innerHeight : el === document ? el.body.clientHeight : parseInt(getComputedStyle(el).height)
                }
                if (prop === 'width') {
                    return el === window ? window.innerWidth : el === document ? el.body.clientWidth : parseInt(getComputedStyle(el).width)
                }
            }

            return this.each((_, el) => {
                if (el === window || el === document) {return }
                if (el.style.hasOwnProperty(prop)) {
                    el.style[prop] = isNaN(val) ? val : val + 'px';
                }
            })
        },

        height: function(val){
            return this._size('height', val)
        },

        width: function(val){
            return this._size('width', val)
        },

        _sizeOut: function(prop, val){
            if (this.length === 0) return

            if (!undef(val) && typeof val !== "boolean") {
                return this.each((_, el) => {
                    if (el === window || el === document) {return }
                    const style = getComputedStyle(el);
                    let h,
                        bs = prop === 'width' ? parseInt(style['border-left-width']) + parseInt(style['border-right-width']) : parseInt(style['border-top-width']) + parseInt(style['border-bottom-width']),
                        pa = prop === 'width' ? parseInt(style['padding-left']) + parseInt(style['padding-right']) : parseInt(style['padding-top']) + parseInt(style['padding-bottom']);

                    h = $(el)[prop](val)[prop]() - bs - pa;
                    el.style[prop] = h + 'px';
                })
            }

            const elem = this[0],
                  size = elem[prop === 'width' ? 'offsetWidth' : 'offsetHeight'],
                  style = getComputedStyle(elem),
                  result = size + parseInt(style[prop === 'width' ? 'margin-left' : 'margin-top']) + parseInt(style[prop === 'width' ? 'margin-right' : 'margin-bottom']);

            return val === true ? result : size
        },

        outerWidth: function(val){
            return this._sizeOut('width', val)
        },

        outerHeight: function(val){
            return this._sizeOut('height', val)
        },

        padding: function(pseudo){
            if (this.length === 0) return
            const style = getComputedStyle(this[0], pseudo);

            return {
                top: parseInt(style["padding-top"]),
                right: parseInt(style["padding-right"]),
                bottom: parseInt(style["padding-bottom"]),
                left: parseInt(style["padding-left"])
            }
        },

        margin: function(pseudo){
            if (this.length === 0) return
            const style = getComputedStyle(this[0], pseudo);

            return {
                top: parseInt(style["margin-top"]),
                right: parseInt(style["margin-right"]),
                bottom: parseInt(style["margin-bottom"]),
                left: parseInt(style["margin-left"])
            }
        },

        border: function(pseudo){
            if (this.length === 0) return
            const style = getComputedStyle(this[0], pseudo);

            return {
                top: parseInt(style["border-top-width"]),
                right: parseInt(style["border-right-width"]),
                bottom: parseInt(style["border-bottom-width"]),
                left: parseInt(style["border-left-width"])
            }
        }
    };

    const Initiator = {
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

            if (this.selector === 'document' || (this.selector && this.selector.nodeType === 9)) {
                this[0] = document;
                this.length = 1;
                return
            }

            if (this.selector instanceof HTMLElement) {
                this.push(this.selector);
                return
            }

            if (typeof this.selector === "object" && isArrayLike(this.selector)) {
                each(this.selector, (key, val) => {
                    this.push(val instanceof Query ? val[0] : val);
                });
                return
            }

            if (typeof this.selector === 'string' && isSelector(this.selector)) {
                [].push.apply(this, document.querySelectorAll(this.selector));
                return
            }

            if (this.selector === "#" || this.selector === ".") {
                console.warn("Selector can't be # or .");
                return
            }

            if (typeof this.selector === "string") {

                const parsed = parseHTML(this.selector);
                const DOMSelector = parsed.length === 1 && parsed[0].nodeType === 3;

                if (DOMSelector) {
                    [].push.apply(this, document.querySelectorAll(this.selector));
                } else {
                    [].push.apply(this, parsed);
                }

                if (this.length > 0 && this.context) {
                    // Additional attributes for elements
                    if (typeof this.context === 'object' && isPlainObject(this.context)) {
                        each(this,(_, el) => {
                            for(let name in this.context) {
                                if (this.context.hasOwnProperty(name))
                                    el.setAttribute(name, this.context[name]);
                            }
                        });
                    } else {
                        // Insert elements into context
                        if (typeof this.context === "string") {
                            this.context = $(this.context);
                        }

                        let contextTargets = [];

                        if (this.context instanceof HTMLElement) {
                            contextTargets.push(this.context);
                        } else if (isArrayLike(this.context)) {
                            [].push.apply(contextTargets, this.context);
                        }

                        const result = [];
                        each(contextTargets, (_, ctx) => {
                            const clone = this.clone(true, true);
                            new Query(ctx).append(clone);
                            each(clone, (_, cl)=>{
                                result.push(cl);
                            });
                        });
                        this.length = 0
                        ;[].push.apply(this, result);
                    }
                }
            }
        }
    };

    const bool = val => {
        if (undef(val)) return false
        if (typeof val === "boolean") return val
        if (typeof val === 'number' && val !== 0) return val
        if (typeof val === 'number' && val === 0) return false
        if (['true', 'ok', 'yes'].includes((""+val).toLowerCase())) return true
        return false
    };

    const Position = {
        offset: function(){
            if (this.length === 0) return

            const el = this[0];
            return {
                top: el.offsetTop,
                left: el.offsetLeft,
                height: el.offsetHeight,
                width: el.offsetWidth,
                parent: el.offsetParent
            }
        },

        position: function(margin){
            let ml = 0, mt = 0, el, style;

            if (this.length === 0) return

            el = this[0];
            style = getComputedStyle(el);

            if (bool(margin)) {
                ml = parseInt(style['margin-left']);
                mt = parseInt(style['margin-top']);
            }

            return {
                left: el.offsetLeft - ml,
                top: el.offsetTop - mt
            }
        },

        left: function(val, margin){
            if (this.length === 0) return

            if (undef(val)) {
                return this.position(margin).left
            }

            if (typeof val === "boolean") {
                margin = val;
                return this.position(margin).left
            }

            return this.each(function(){
                $(this).css({
                    left: val
                });
            })
        },

        top: function(val, margin){
            if (this.length === 0) return

            if (undef(val)) {
                return this.position(margin).top
            }

            if (typeof val === "boolean") {
                margin = val;
                return this.position(margin).top
            }

            return this.each(function(){
                $(this).css({
                    top: val
                });
            })
        },

        coord: function(){
            return this.length === 0 ? undefined : this[0].getBoundingClientRect()
        },

        pos: function(){
            if (this.length === 0) return

            return {
                top: parseInt($(this[0]).style("top")),
                left: parseInt($(this[0]).style("left"))
            }
        }
    };

    const Serialize = {
        serializeForm: function(form){
            const _form = $(form)[0], q = [];

            if (!_form || _form.nodeName !== "FORM") {
                console.warn("Element is not a HTMLFromElement");
                return;
            }

            for (let i = _form.elements.length - 1; i >= 0; i = i - 1) {
                if (_form.elements[i].name === "") {
                    continue;
                }
                switch (_form.elements[i].nodeName) {
                    case 'INPUT':
                        switch (_form.elements[i].type) {
                            case 'checkbox':
                            case 'radio':
                                if (_form.elements[i].checked) {
                                    q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                                }
                                break;
                            case 'file':
                                break;
                            default: q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                        }
                        break;
                    case 'TEXTAREA':
                        q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                        break;
                    case 'SELECT':
                        switch (_form.elements[i].type) {
                            case 'select-one':
                                q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                                break;
                            case 'select-multiple':
                                for (let j = _form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                    if (_form.elements[i].options[j].selected) {
                                        q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].options[j].value));
                                    }
                                }
                                break;
                        }
                        break;
                    case 'BUTTON':
                        switch (_form.elements[i].type) {
                            case 'reset':
                            case 'submit':
                            case 'button':
                                q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                                break;
                        }
                        break;
                }
            }
            return q;
        },

        serializeObject(obj){
            const q = [];
            for(let key in obj) {
                q.push(`${key}=${encodeURIComponent(obj[key])}`);
            }
            return q
        },

        serialize(o, joinWith ){
            let result;

            if (o.nodeName && o.nodeName === 'FORM') {
                result = Serialize.serializeForm(o);
            } else if (Array.isArray(o)) {
                result = o;
            } else if (toType(o) === 'object') {
                result = Serialize.serializeObject(o);
            } else {
                result = [];
            }

            return joinWith ? result.join(joinWith) : result
        }
    };

    const defaultOptions = {
        uid: 'uid',
        prevObj: null
    };

    class Query$1 extends Array {
        get [Symbol.toStringTag](){return "Query"}

        [Symbol.toPrimitive](hint){
            if (hint === "string") {
                const arr = [...this];
                return JSON.stringify(arr)
            }

            return this.value
        }

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
    }

    const query = (...rest) => new Query$1(...rest);
    const $$1 = query;

    Query$1.use = (...mixins) => Object.assign(Query$1.prototype, ...mixins);
    query.use = (...mixins) => Object.assign(query, ...mixins);

    Query$1.use(
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
    );

    query.use({
        dataset: new DataSet(),
        matches: matches,
        html: $$1('html'),
        doctype: $$1("doctype"),
        head: $$1('head'),
        body: $$1('body'),
        document: $$1('document'),
        window: $$1('window'),
        meta: name => !name ? $$1("meta") : $$1("meta[name=$name]".replace("$name", name)),
        metaBy: name => !name ? $$1.meta : $$1("meta[$name]".replace("$name", name)),
        charset: val => {
            if (val) {
                const m = $$1('meta[charset]');
                if (m.length > 0) {
                    m.attr('charset', val);
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
    });

    Query$1.use({
        data(key, val){
            let elem, data;

            if (this.length === 0) {
                return
            }

            elem = this[0];

            if (!arguments.length) {
                data = $$1.dataset.get(elem);
                if (!data) {
                    data = {};
                    for(let attr of [...elem.attributes]) {
                        const attrName = attr.name;
                        if (attrName.startsWith('data-')) {
                            ({
                                [attrName]: elem.getAttribute(attrName)
                            });
                            // data.push([attrName, elem.getAttribute(attrName)])
                            data[attrName] = elem.getAttribute(attrName);
                        }
                    }
                }
                return data
            }

            if (arguments.length === 1) {
                return $$1.dataset.get(elem, key) || $$1.dataset.attr(elem, key)
            }

            return this.each( function() {
                $$1.dataset.set( this, key, val );
            })
        },

        removeData( key ) {
            return this.each( function() {
                $$1.dataset.remove( this, key );
            })
        }
    });

    let _$ = globalThis.$;

    query.use({
        global(){
            _$ = globalThis.$;
            globalThis.$ = $$1;
        },
        noConflict(){
            if ( globalThis.$ === $$1 ) {
                globalThis.$ = _$;
            }
            return $$1
        }
    });

    globalThis.Query = Query$1;
    query.global();

})();
