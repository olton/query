export const isLocalhost = host => {
    const hostname = host || globalThis.location.hostname;
    return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]" ||
        hostname === "" ||
        hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) !== null
    )
}