// Aurora Package Manager for Constellinux Shell

async function init(arguements) {
    const system = csw.permissions.elevate()

    csw.versions.registerApp("aurora", "apmv0.1.1")
    //csw.versions.registerApp("apmv0.1.1")
    if (!system.aurora.init) {
        system.aurora = {...system.aurora, ...{version: 0.01, directory: "/usr/bin/aurora", init: true, index: JSON.parse(system.files.get(system.aurora.directory + "/index.json") || "{}") } }
    }
    const aurora = system.aurora
    const index = system.aurora.index

    // test if system has aurora initialised already
    if (system.folders[aurora.directory] == undefined) {
        // aurora has not been used yet
        system.folders.writeFolder(aurora.directory)
    }

    if (system.files.get(aurora.directory + "/index.json") == undefined) {
        system.files.writeFile(aurora.directory + "/index.json", JSON.stringify({}))
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
    let keys

    const isSilent = flags.includes("-s")

    switch(args[0]) {
        case "install":
            if (!isSilent) {
                id1 = console.post("install of " + args[1] + " 0% completed")
                id2 = console.post("--------------------")
            }
            
            // download the package info
            data = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/info.json")
            if (!isSilent) {
                console.edit("install of " + args[1] + " 50% completed", id1)
                console.edit("##########----------", id2)
            }

            // parse it, and if it's invalid, catch and tell the user the package either doesn't exist OR is formatted wrong
            try {
                data = JSON.parse(data)
            } catch(e) {
                if (e == 'SyntaxError: "undefined" is not valid JSON') {
                    console.edit("Installation of " + args[1] + " has failed because the package does not exist.", id1, "error")
                    console.edit("", id2, "error")
                } else {
                    console.edit("Installation of " + args[1] + " has failed because the package info is invalid: " + e, id1, "error")
                    console.edit("", id2, "error")
                }
                break;
            }

            // install dependencies
            for (const i in data.dependencies) {
                system.startProcess("/bin/aurora.js", ["install", data.dependencies[i]], true)
            }

            index[args[1]] = true

            for (const i in data.directories) {
                system.folders.writeFolder(data.directories)
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
                console.edit("install of " + args[1] + " 100% completed", id1)
                console.edit("####################", id2)
            }
            break;
        case "uninstall":
            data = await system.fetchURL(aurora.url + "/pkgs/" + args[1] + "/info.json")
            system.files.deleteFile(aurora.directory + "/" + args[1] + "." + data.lang)
            delete index[args[1]]
            break;
        case "info":
            keys = Object.keys(aurora)
            for (const i in keys) {
                console.post("   " + keys[i] + ": " + aurora[keys[i]])
            }
            break;
        case "list":
            console.log(index)
            keys = Object.keys(index)
            for (const i in keys) {
                console.post("  -  " + keys[i])
            }
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

    system.files.writeFile(aurora.directory + "/index.json", JSON.stringify(index))
}