import {camelCase} from "../helpers/camel-case.js";
import {parseData} from "../helpers/data-attribute.js";

export class DataSet {
    constructor() {
        this._dataset = new Map()
    }

    set(element, key, data){
        if (!this._dataset.has(element)) {
            this._dataset.set(element, new Map())
        }

        const instanceMap = this._dataset.get(element)

        if (!instanceMap.has(key) && instanceMap.size !== 0) {
            console.error(`Query doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`)
            return
        }

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

export const QueryDataSet = {
    data(key, val){
        let res, elem, data, attrs, name, i

        if (this.length === 0) {
            return
        }

        elem = this[0]

        if (!arguments.length) {
            data = $.dataset.get(elem)
            if (!data) {
                data = []
                for(let attr of elem.attributes) {
                    if (attr.startsWith('data-')) {
                        data.push({attr: elem.getAttribute(attr)})
                    }
                }
            }
            return data
        }

        if (arguments.length === 1) {
            return $.dataset.get(elem, key) || $.dataset.attr(elem, key)
        }

        return this.each( function() {
            $.dataset.set( this, key, val )
        })
    },

    removeData( key ) {
        return this.each( function() {
            $.dataset.remove( this, key )
        })
    }
}