#! /usr/bin/node

async function request(target, msg) {
    const promise =  new Promise((resolve) => {
        let interval = setInterval(async () => {
            const msgs = await call.readMsgs(true)

            for (const i in msgs) {
                const msg = msgs[i]

                if (msg.origin == target) {
                    // treat this like a reply
                    clearInterval(interval)
                    resolve(msg)
                }
            }
        }, 10)
    })

    call.send(target, msg)

    return promise
}

async function init([command, data1, data2, data3, data4]) {
    switch (command) {
        case "wallpaper":
            const nimbus = call.pidOfName("nimbusDE");

            switch (data1) {
                case "set":
                    await call.send(nimbus, {
                        intent: "wallpaperSet",
                        wallpaper: data2
                    })
                    break;
                case "get":
                    const msg = await request(nimbus, {
                        intent: "wallpaperGet",
                        wallpaper: data2
                    })
                    std.out = msg.content
                    break;
                case "list":
                    break;
                default:

            }
            break;
        case undefined:
        case "":
            std.out = `\nExample Usage:
nimbusctl wallpaper set [wallpaperName]
nimbusctl wallpaper get
nimbusctl wallpaper list`
            break;
        default:
            std.out = `[ERR]Unknown Command: ${command}`
            return
    }
}