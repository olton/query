import {each} from "../helpers/each.js";

export const appendScript = (el, context = document.body) => {
    if (!context instanceof HTMLElement) {
        return
    }

    const elements = $(el)

    each(elements, (_, scr) => {
        if (scr.tagName && scr.tagName === "SCRIPT") {
            const s = document.createElement('script')
            s.type = 'text/javascript'
            if (scr.src) {
                s.src = scr.src
            } else {
                s.textContent = scr.innerText
            }
            context.appendChild(s)
            if (scr.parentNode)
                scr.parentNode.removeChild(scr);
            return s
        }
    })
}

export const Script = {
    script(context){
        appendScript(this, context)
        return this
    }
}