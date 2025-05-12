// Download from web URL
// last revision: 15/2/2025, 11:17 // now 17/3/2025, 20:35 // now 12/5/2025, 08:05

async function request(target, msg) {
        call.send(target, msg)

        return new Promise((resolve) => {
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
    }

    const networkd = await call.pidOfName("networkd")
    async function fetchURL(URL) {
        const data = await request(networkd, {
            intent: "networkRequest",
            type: "GET",
            target: URL
        })

        return data.content
    }

async function init(args) {
    let data = await fetchURL(args[0])
    await call.write(await call.fullDirectory(args[1] || "") + args[0].textAfterAll("/"), data)
}