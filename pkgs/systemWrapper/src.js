// wrapper for system calls

function init() {
    //const system = window[window["12hider for system"]]
    
    local.permissionTokens = {}

    class token {
        constructor(PID) {
            this.allowedPID = PID
        }


    }

    csw = {}
    
    // console logging functions
    csw.console = {}
    csw.console.log = function (token, name, str) {
        return system.log(name, str)
    }
    csw.console.post = function (token, name, str) {
        return system.post(name, str)
    }
    csw.console.warn = function (token, name, str) {
        return system.warn(name, str)
    }
    csw.console.error = function (token, name, str) {
        return system.error(name, str)
    }
    csw.console.edit = function (token, name, str, id, newType) {
        return system.editLog(name, str, id, newType)
    }

    // files functions
    csw.fs = {}
        // files
        csw.fs.read = function (token, directory, attribute) {
            if (directory == undefined) {
                return "directory must be defined!"
            }
            
            return system.fs.readFile(directory, attribute)
        }
        csw.fs.write = function (token, directory, contents) {
            if (directory == undefined || contents == undefined) {
                return "directory AND contents must be defined!"
            }
            
            return system.fs.writeFile(directory, contents)
        }
        csw.fs.delete = function (token, directory) {
            if (directory == undefined) {
                return "directory must be defined!"
            }
            
            return system.files.deleteFile(directory)
        }

        // folders
        csw.fs.createDir = function (token, directory) {
            if (directory == undefined) {
                return "directory must be defined!"
            }
            
            return system.fs.writeFolder(directory)
        }
        csw.fs.deleteDir = function (token, directory, recursive, verbose) {
            if (directory == undefined) {
                return "directory must be defined!"
            }

            return system.fs.deleteFolder(directory, recursive, verbose)
        }
        csw.fs.listDir = async function (token, directory) {
            if (directory == undefined) {
                return "directory must be defined!"
            }

            return system.fs.rawFolder(directory).list()
        }

        csw.fs.isDirectory = function (token, directory) {
            if (directory == undefined) {
                return "directory must be defined!"
            }
            
            return system.fs.isFolder(directory)
        }
        
        csw.fs.toDirectory = function (token, directory, baseDir) {
            if (directory == undefined || baseDir == undefined) {
                return "directory AND baseDir must be defined!"
            }
            
            return system.toDir(directory, baseDir)
        }

    // process management
    csw.processes = {}
    csw.processes.execute = function (token, directory, args, isUnsafe) {
        // please make sure only admin processes can start admin processes!
        return system.startProcess(directory, args, isUnsafe)
    }
    csw.processes.terminate = function (token, PID) {
        return system.stopProcess(PID)
    }


    // terminal CLI features
    csw.terminal = {}
    csw.terminal.fullscreenApp = ""
    // terminal fullscreening support
    csw.terminal.fullscreen = function (token, PID) {
        csw.terminal.fullscreenApp = PID
        system.focus.push(PID)
    }
    csw.terminal.set = function (token, PID, data) {
        system.processes[PID].display = data

        if (PID == system.fcs) {
            system.refreshDisplay()
        }
    }

    // versions system
    csw.versions = {}
    csw.versions.registerApp = function (token, Name, Version) {
        system.versions[Name] = Version
    }

    // networking
    csw.net = {}
    csw.net.fetch = async function (token, url) {
        return await system.fetchURL(url)
    }

    // TEMPORARY ELEVATION FUNCTION
    csw.permissions = {}
    csw.permissions.elevate = function (token) {
        return system
    }

    // Work out what functions we have so we can replace them all to include the accessToken
    const functions = []

    const cswKeys = Object.keys(csw)
    for (const i in cswKeys) {
        const key = csw[cswKeys[i]]
        const keyKeys = Object.keys(key)

        for (const j in keyKeys) {
            const item = key[keyKeys[j]]

            if (typeof item == "function") {
                functions.push("csw." + cswKeys[i] + "." + keyKeys[j])
            }
        }
    }
    csw.functions = functions
    
    system.log(Name, "systemWrapper Loaded.")
    system.systemWrapper = true

}

function frame() {}