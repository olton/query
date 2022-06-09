export const parseData = data => {
    try {
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}

export const dataAttr = (elem, key, data) => {
    if (elem.nodeType !== 1) {
        return undefined
    }

    if ( !data ) {
        const name = "data-" + key.replace(/[A-Z]/g, "-$&").toLowerCase();
        data = elem.getAttribute(name);
    } else {
        data = parseData( data );
        $.dataset.set( elem, key, data );
    }

    return data;
}