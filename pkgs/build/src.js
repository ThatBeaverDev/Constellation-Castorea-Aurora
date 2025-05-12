// build a system in a file


async function init() {

    
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

    let html = await fetchURL("./index.html")
    const styles = await fetchURL("/styles.css")
    const pageStyles = await fetchURL("./styles.css")
    let ldr = await call.read("/boot/loader.js")
    let kernel = await call.read("/boot/castoreaKernel.js")

    // patch over kernel
    kernel = kernel.replaceAll('system.aurora.url = "../aurora" // aurora URL set', 'system.aurora.url = "https://raw.githubusercontent.com/ThatBeaverDev/aurora/refs/heads/main"')

    // patch over loader
    ldr = ldr.replaceAll('system.baseURI = "."', 'system.baseURI = "https://raw.githubusercontent.com/ThatBeaverDev/Constellation/refs/heads/main"')

    // patch over HTML page to include embedded styles and loader
    html = html.replaceAll('<script src="./boot/loader.js"></script><!--bootloader-->', '<script>' + ldr + '</script><!--modified origin bootloader! :D-->')
    html = html.replaceAll('<link href="/styles.css" rel="stylesheet"><!--styles-->', '<style>\n' + styles + '\n</style>')
    html = html.replaceAll('<link href="./styles.css" rel="stylesheet"><!--pageStyles-->', '<style>\n' + pageStyles + '\n</style>')

    await call.write(await call.fullDirectory("system.html", parent.dir), html)

    std.out = "Build completed and placed at in " + await call.fullDirectory("system.html", parent.dir)
}