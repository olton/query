import {$, Query, query} from "../../src/index.js"

$.each($("div").data(), function(key, value){
    console.log(key, value)
});