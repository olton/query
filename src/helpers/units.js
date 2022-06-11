const parseUnit = (str) => {
    const out = [ 0, '' ]
    const _str = ""+str
    out[0] = parseFloat(_str)
    out[1] = _str.match(/[\d.\-+]*\s*(.*)/)[1] || ''
    return out
}

const getUnit = (val, defaultValue = 'px') => {
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    return typeof split[1] !== "undefined" ? split[1] : defaultValue;
}

export {
    parseUnit,
    getUnit
}