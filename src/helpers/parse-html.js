export const parseHTML = function (html) {
    const regexpSingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i
    let base, singleTag, result = [], doc

    if (typeof html !== "string") {
        return []
    }

    doc = document.implementation.createHTMLDocument("")
    base = doc.createElement( "base" )
    base.href = document.location.href
    doc.head.appendChild( base )

    singleTag = regexpSingleTag.exec(html)

    if (singleTag) {
        result.push(document.createElement(singleTag[1]))
    } else {
        doc.body.innerHTML = html
        for(let i = 0; i < doc.body.childNodes.length; i++) {
            result.push(doc.body.childNodes[i])
        }
    }

    return result
}