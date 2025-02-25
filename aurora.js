// Aurora Package Manager for Constellinux Shell

async function init(arguements) {
    system.aurora = {...system.aurora, ...{version: 0.01, directory: "/usr/bin/aurora"}}
    const aurora = system.aurora
    // test if system has aurora initialised already
    if (system.folders[aurora.directory] == undefined) {
        // aurora has not been used yet
        system.folders.writeFolder(aurora.directory)
    }
    
    if (!system.path.includes(aurora.directory)) {
        system.path.push(aurora.directory)
    }

    const args = []
    const flags = []

    // check for flag parameters, and make sure they are in a seperate array
    for (const i in arguements) {
        if (arguements[i][0] == "-") {
            flags.push(arguements[i])
        } else {
            args.push(arguements[i])
        }
    }



    let data
    let file
    let id1
    let id2

    const isSilent = flags.includes("-s")

    switch(args[0]) {
        case "install":
            if (!isSilent) {
                console.post("installing " + args[1] + " from aurora...")
                id1 = console.post("installation: 0%")
                id2 = console.post("--------------------")
            }
            
            // download the package info
            data = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/info.json")
            if (!isSilent) {
                console.edit("installation: 50%", id1)
                console.edit("##########----------", id2)
            }

            // parse it, and if it's invalid, catch and tell the user the package either doesn't exist OR is formatted wrong
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
            // download the file
            file = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/src." + data.lang)

            if (data.directory !== undefined) {
                // write the file to it's specific directory
                // I intend to require elevated permissions for this in future
                system.files.writeFile(data.directory + "/" + args[1] + "." + data.lang, file)
            } else {    
                // write the file
                system.files.writeFile(aurora.directory + "/" + args[1] + "." + data.lang, file)
            }

            if (!isSilent) {
                console.edit("installation: 100%", id1)
                console.edit("####################", id2)
            }
            break;
        case "uninstall":
            data = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/info.json")
            system.files.deleteFile(aurora.directory + "/" + args[1] + "." + data.lang)
            break;
        case "info":
            const keys = Object.keys(aurora)
            for (const i in keys) {
                console.post("   " + keys[i] + ": " + aurora[keys[i]])
            }
            break;
        case "list":
            console.post(system.folders.listDirectory(aurora.directory).join("\n"))
            break;
        case undefined:
        case "":
            console.post("Example Usage:")
            console.post("   - aurora install [package-name]")
            console.post("   - aurora uninstall [package-name]")
            console.post("   - aurora list")
            console.post("   - aurora info")
            console.post("")
            console.post("   - aurora -s:     runs aurora silently")
            break;
        default:
            console.error("Error: Unknown command: aurora " + args[0])
    }
}