// build a system in a file

async function init() {
    let html = await csw.net.fetch("./index.html")
    const styles = await csw.net.fetch("/styles.css")
    let ldr = csw.fs.read("/boot/loader.js")
    let kernel = csw.fs.read("/boot/kernel.js")

    // patch over kernel
    kernel = kernel.replaceAll('system.aurora.url = "../aurora" // aurora URL set', 'system.aurora.url = "https://raw.githubusercontent.com/ThatBeaverDev/aurora/refs/heads/main"')
    
    // patch over loader
    ldr = ldr.replaceAll('system.baseURI = "."', 'system.baseURI = "https://raw.githubusercontent.com/ThatBeaverDev/Constellinux/refs/heads/main"')
    ldr = ldr.replaceAll('const kern = await system.fetchURL(system.baseURI + "/boot/kernel.js") // kernel download', 'const kern = `' + kernel.replaceAll("\\", "\\\\") + '`')

    // patch over HTML page to include embedded styles and loader
    html = html.replaceAll('<script src="./boot/loader.js"></script><!--bootloader-->', '<script>' + ldr + '</script><!--modified origin bootloader! :D-->')
    html = html.replaceAll('<link rel="stylesheet" href="/styles.css"><!--styles-->', '<style>\n' + styles + '\n</style>')

    csw.fs.write(csw.fs.toDirectory("system.html"), html)

    console.log("Build completed and placed at in " + csw.fs.toDirectory("system.html"))
}