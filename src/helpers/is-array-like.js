export const isArrayLike = obj => {
    return (
        Array.isArray(obj) || (
            typeof obj === "object" &&
            "length" in obj &&
            typeof obj.length === "number" &&
            obj.length >= 0
        )
    )
}