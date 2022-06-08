import {isPlainObject} from "./is-plain-object.js"

export const parseHTML = function (data, context) {
    const regexpSingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i
    let base, singleTag,
        result = [], ctx, _context

    if (typeof data !== "string") {
        return []
    }

    data = data.trim()

    ctx = document.implementation.createHTMLDocument("")
    base = ctx.createElement( "base" )
    base.href = document.location.href
    ctx.head.appendChild( base )
    _context = ctx.body

    singleTag = regexpSingleTag.exec(data)

    if (singleTag) {
        result.push(document.createElement(singleTag[1]))
    } else {
        _context.innerHTML = data
        for(let i = 0; i < _context.childNodes.length; i++) {
            result.push(_context.childNodes[i])
        }
    }

    if (context && isPlainObject(context)) {
        this.each(result,function(){
            const el = this
            for(let name in context) {
                if (context.hasOwnProperty(name))
                    el.setAttribute(name, context[name])
            }
        })
    }

    return result
}