// Aurora Package Manager for Constellinux Shell

async function init(args) {
    let aurora = {version: 0.01, directory: "/usr/bin/aurora", url: "../aurora"}
    // test if system has aurora initialised already
    if (system.folders[aurora.directory] == undefined) {
        // aurora has not been used yet
        system.folders.writeFolder(aurora.directory)
    }
    
    if (!system.path.includes(aurora.directory)) {
        system.path.push(aurora.directory)
    }

    let data
    let file
    switch(args[0]) {
        case "install":
            console.post("installing " + args[1] + " from aurora...")
            const id1 = console.post("installation: 0%")
            const id2 = console.post("--------------------")
            data = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/info.json")
            console.edit("installation: 50%", id1)
            console.edit("##########----------", id2)
            try {
                data = JSON.parse(data)
            } catch(e) {
                if (e == 'SyntaxError: "undefined" is not valid JSON') {
                    console.error("Installation has failed: package does not exist.")
                } else {
                    console.error("Installation has failed: package info is not valid JSON:" + e)
                }
                break;
            }
            file = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/src." + data.lang)
            system.files.writeFile(aurora.directory + "/" + args[1] + "." + data.lang, file)
            console.edit("installation: 100%", id1)
            console.edit("####################", id2)
            break;
        case "uninstall":
            data = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/info.json")
            system.files.deleteFile(aurora.directory + "/" + args[1] + "." + data.lang)
            break;
        case "info":
            console.post(aurora)
            break;
        case "list":
            console.post(system.folders.listDirectory(aurora.directory).join("\n"))
            break;
        case undefined:
        case "":
            console.post("Example Usage:")
            console.post("     aurora install [package-name]")
            console.post("     aurora uninstall [package-name]")
            console.post("     aurora list")
            console.post("     aurora info")
            break;
        default:
            console.error("Error: Unknown command: aurora " + args[0])
    }
}