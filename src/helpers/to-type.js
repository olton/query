// Shoutout AngusCroll (https://goo.gl/pxwQGp)

export const toType = obj => ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
