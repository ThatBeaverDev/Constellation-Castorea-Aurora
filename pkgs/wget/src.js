// Download from web URL


async function init([URI]) {

    local.networkd = await call.pidOfName("networkd")

    local.libmsg = await call.getLibrary("libmsg");

    if (URI == undefined) {
        std.out = "[ERR]No URI was provided."
        return
    }

    let data

    try {
        data = await local.libmsg.request(local.networkd, {
            intent: "networkRequest",
            type: "get",
            target: URI
        })
    } catch (e) {
        std.out = "[ERR]" + e
        return
    }

    std.out = data.content
}