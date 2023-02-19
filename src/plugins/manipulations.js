import {each} from "../helpers/each.js";
import {isArrayLike} from "../helpers/is-array-like.js";
import {isSelector} from "../helpers/is-selector.js";
import {parseHTML} from "../helpers/parse-html.js";
import {appendScript} from "./script.js";

const args = function() {
    let elements = [], _args = [...arguments]

    for (let arg of _args) {
        elements = [].concat(elements, normalizeElements(arg))
    }

    return elements
}

const normalizeElements = function(s){
    let result = undefined

    if (typeof s === "string")
        result = isSelector(s) ? $(s) : parseHTML(s)
    else if (s.nodeType && s.nodeType === 1)
        result = [s]
    else if (isArrayLike(s))
        result = s

    return result
}

export const Manipulations = {
    appendText(text){
        return this.each((_, el) => el.innerHTML += text)
    },

    prependText(text){
        return this.each((_, el) => el.innerHTML = text + el.innerHTML);
    },

    append(){
        let elements = args(...arguments)

        return this.each( (index, el) => {
            each(elements, (_, ch) => {
                if (el === ch) return
                const child = index === 0 ? ch : ch.cloneNode(true)
                if (child.tagName && child.tagName !== "SCRIPT") el.append(child)
                appendScript(child)
            })
        })
    },

    appendTo(){
        let elements = args(...arguments)

        return this.each((index, el) => {
            each(elements, (parIndex, parent) => {
                if (el === parent) return
                $(parent).append(parIndex === 0 ? el : el.cloneNode(true));
            })
        })
    },

    prepend(){
        let elements = args(...arguments)

        return this.each( (elIndex, el) => {
            each(elements, (_, ch) => {
                if (el === ch) return
                const child = elIndex === 0 ? ch : ch.cloneNode(true)
                if (child.tagName && child.tagName !== "SCRIPT") el.prepend(child)
                appendScript(child)
            })
        })
    },

    prependTo(){
        let elements = args(...arguments)

        return this.each((index, el) => {
            each(elements, (parIndex, parent) => {
                if (el === parent) return
                $(parent).prepend(parIndex === 0 ? el : el.cloneNode(true));
            })
        })
    },

    insertBefore(){
        let elements = args(...arguments)

        return this.each((index, el) => {
            each(elements, (elIndex, ch) => {
                if (el === ch) return
                if (ch.parentNode) {
                    ch.parentNode.insertBefore(elIndex === 0 ? el : el.cloneNode(true), ch)
                }
            })
        })
    },

    insertAfter(){
        let elements = args(...arguments)

        return this.each((index, el) => {
            each(elements, (elIndex, ch) => {
                if (el === ch) return
                if (ch.parentNode) {
                    ch.parentNode.insertBefore(elIndex === 0 ? el : el.cloneNode(true), ch.nextSibling);
                }
            })
        })
    },

    after(html){
        return this.each(function(){
            const el = this
            if (typeof html === "string") {
                el.insertAdjacentHTML('afterend', html)
            } else {
                $(html).insertAfter(el)
            }
        })
    },

    before(html){
        return this.each(function(){
            const el = this
            if (typeof html === "string") {
                el.insertAdjacentHTML('beforebegin', html)
            } else {
                $(html).insertBefore(el)
            }
        })
    },

    clone(deep = false, withData = false){
        const res = []
        this.each((_, el) => {
            const clone = $(el.cloneNode(deep))
            if (withData) {
                const data = $.dataset.get(el)
                each(data, function(k, v){
                    $.dataset.set(clone, k, v)
                })
            }
            res.push(clone)
        })

        return $(res)
    },

    import(deep = false){
        const res = []
        this.each((_, el) => res.push(document.importNode(el, deep)))
        return $(res)
    },

    adopt(){
        const res = []
        this.each((_, el) => res.push(document.adoptNode(el)))
        return $(res)
    },

    remove(selector){
        let i = 0, node, out
        const res = []

        if (this.length === 0) {
            return this
        }

        out = selector ? this.filter((el) => $.matches.call(el, selector)) : this

        for ( ; ( node = out[ i ] ) != null; i++ ) {
            if (node.parentNode) {
                res.push(node.parentNode.removeChild(node))
                $.dataset.removeAll(node)
            }
        }

        return $(res)
    },

    clear(){
        return this.each((_, el)=>el.innerHTML = '')
    },

    wrap(el){
        const wrapper = $(normalizeElements(el))
        const res = []

        if (!this.length || !wrapper.length) {
            return
        }

        this.each((_, el) => {
            let _wrapper = wrapper.clone(true, true)
            _wrapper.insertBefore(el)
            let _target = _wrapper
            while (_target.children().length) {
                _target = _target.children().eq(0)
            }
            _target.append(el)
            res.push(_wrapper)
        })

        return $(res)
    },

    wrapAll( el ){
        const wrapper = $(normalizeElements(el));
        let _wrapper, _target;

        if (!this.length || !wrapper.length) {
            return
        }

        _wrapper = wrapper.clone(true, true)
        _wrapper.insertBefore(this[0])

        _target = _wrapper;
        while (_target.children().length) {
            _target = _target.children().eq(0);
        }

        this.each(function(){
            _target.append(this);
        })

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