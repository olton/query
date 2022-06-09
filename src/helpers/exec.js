export const exec = (fn, args, context) => {
    let func

    if (typeof fn === "function") {
        func = fn
    } else
    if (/^[a-z]+[\w.]*[\w]$/i.test(fn)) {
        const ns = fn.split(".")
        func = globalThis

        for(let i = 0; i < ns.length; i++) {
            func = func[ns[i]]
        }
    } else {
        func = new Function("a", fn)
    }

    return func.apply(context, args)
}