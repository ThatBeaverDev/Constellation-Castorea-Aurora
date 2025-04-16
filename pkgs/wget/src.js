// Download from web URL
// last revision: 15/2/2025, 11:17 // now 17/3/2025, 20:35

async function init(args) {
    let data = await csw.net.fetch(args[0])
    csw.fs.write(csw.fs.toDirectory(args[1] || "") + args[0].textAfterAll("/"), data)
}