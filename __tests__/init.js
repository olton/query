import 'jsdom-global/register'
import {$} from "../src/index.js"

describe('Testing init method', () => {
    it('Create element', () => {
        expect($("<div>").length).toBe(1)
    })
    it('From element', () => {
        document.body.innerHTML = `
            <div>123</div>
        `
        expect($("div").length).toBe(1)
    })
    it('From element by class', () => {
        document.body.innerHTML = `
            <div class="test-div">123</div>
        `
        expect($(".test-div").length).toBe(1)
    })
})