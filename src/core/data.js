export class DataSet {
    constructor() {
        this._dataset = new Map()
    }

    set(element, key, data){
        if (!this._dataset.has(element)) {
            this._dataset.set(element, new Map())
        }

        const instanceMap = this._dataset.get(element)

        // TODO check this
        //if (!instanceMap.has(key) && instanceMap.size !== 0) {
            //console.error(`Query doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`)
            //return
        //}

        instanceMap.set(key, data)
    }

    get(element, key, defaultValue = null){
        if (this._dataset.has(element)) {
            const elementData = this._dataset.get(element)
            return key ? elementData.get(key) || defaultValue : elementData
        }

        return null
    }

    remove(element, key){
        if (!this._dataset.has(element)) {
            return
        }

        const instanceMap = this._dataset.get(element)

        instanceMap.delete(key)

        if (instanceMap.size === 0) {
            this._dataset.delete(element)
        }
    }

    removeAll(element){
        if (!this._dataset.has(element)) {
            return
        }
        this._dataset.delete(element)
    }

    attr(elem, key, data){
        if (elem.nodeType !== 1 || !key) {
            return undefined
        }

        const attrName = "data-" + key.replace(/[A-Z]/g, "-$&").toLowerCase();

        if ( data ) {
            elem.setAttribute(attrName, JSON.stringify( data ))
        }

        return elem.getAttribute(attrName);
    }
}
