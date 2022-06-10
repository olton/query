import {each} from "../helpers/each.js";

export const Utils = {
    toArray: function(){
        return [...this]
    },
    age(){
        return this.timestamp
    },
    each(cb){
        return each(this, cb)
    },
}