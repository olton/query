export const dashedName = (key) => key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`)