const MAX_UID = 1_000_000

export const uid = prefix => {
    do {
        prefix += Math.floor(Math.random() * MAX_UID)
    } while (document.getElementById(prefix))

    return prefix
}