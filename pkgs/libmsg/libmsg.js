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

return {
    request
}