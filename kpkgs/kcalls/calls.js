system.memory.kernel.lib = {}
system.memory.kernel.lib.calls = {}
system.syscalls = system.memory.kernel.lib.calls
const c = system.memory.kernel.lib.calls

// filesystem
c.read = (PID, directory, attribute = "contents") => {
    const dir = system.toDir(directory, c.getcwd(PID))

    if (sse.manyDebug == true) {
        system.debug(PID, "readFile " + directory)
    }

    return system.fs.readFile(dir, attribute)
}
c.write = async (PID, directory, content) => {
    const dir = system.toDir(directory, c.getcwd(PID))
    await system.fs.writeFile(dir, content, c.whoami(PID))
    return 0
}
//c.rename = (oldDir, newDir) => {

//}
c.unlink = async (PID, directory) => {
    const dir = system.toDir(directory, c.getcwd(PID));
    if (await system.fs.isFolder(dir)) {
        await system.fs.deleteFolder(dir, c.whoami(PID), c.whoami(PID))
    } else {
        await system.fs.deleteFile(dir, c.whoami(PID), c.whoami(PID))
    }
}
c.isFolder = async (PID, directory) => {
    const dir = system.toDir(directory, c.getcwd(PID));
    return system.fs.isFolder(dir)
}
//c.utime = (directory) => {

//}

//c.chmod = (directory) => {

//}
//c.chown = (directory) => {

//}
c.whoami = (PID) => {
    return system.processes[PID].user
}
c.chusr = async (PID, username, password) => {
    const users = await system.fs.readFile("/System/users.json")
    const userdata = users[username]
    if (userdata == undefined) throw new Error(`User ${username} does not exist.`)

    const passhash = await system.userPasswordHash(password)

    if (passhash == userdata.password) {
        system.processes[PID].user = username
        return true
    } else {
        throw new Error("Password is incorrect.")
    }
}

c.readdir = async function (PID, directory, attribute = "children") {
    switch (attribute) {
        case "children":
            return await system.fs.listFolder(directory, c.whoami(PID))
            break;
        case "permissions":
            const permissions = await system.fs.folderPermissions(directory, c.whoami(PID))
            return structuredClone(permissions)
            break;
        default:
            return await system.fs.rawFolder(directory, c.whoami(PID))[attribute]
    }
}
c.mkdir = async function (PID, directory) {
    try {
        const dir = system.toDir(directory, c.getcwd(PID))
        await system.fs.writeFolder(dir, c.whoami(PID))
    } catch (e) {
        return -1
    }
    return 0
}
c.mount
c.umount

c.chdir = (PID, target) => {
    try {
        const newDir = system.toDir(target, c.getcwd(PID))
        system.processes[PID].cwd = newDir
    } catch (e) {
        return -1
    }
    return 0
}
c.getcwd = (PID) => {
    return String(system.processes[PID].cwd);
}
c.exists = async (PID, location) => {
    return await system.fs.exists(location)
}
c.isDir = async (PID, location) => {
    return await system.fs.isFolder(location)
}

c.exec = async function (PID, directory, args, stdin, sharedMemory, options = {}) {

    const opt = {
        user: c.whoami(PID)
    }

    if (options.username !== undefined) {
        const passhash = await system.userPasswordHash(options.password)
        const users = await c.read(0, "/System/users.json")
        const targetUserObj = users[options.username]

        if (targetUserObj.password === passhash) {
            // correct password!
            opt.username = String(options.username)
        } else {
            throw new Error("Incorrect username or password.")
        }
    }

    return system.startProcess(PID, directory, args, stdin, opt.username, sharedMemory)
}
c.kill = (PID, targetPID) => {
    if (targetPID == ".") {
        system.stopProcess(targetPID)
        return;
    }

    console.debug(targetPID)
    const user = c.whoami(PID)
    if (user !== "root") {
        return -1
    }
    system.stopProcess(targetPID, false)
    return 0
}

c.getpid = (PID) => {
    return PID
}
c.getuid = (PID) => ""

c.chroot = (PID, dir) => {
    const user = c.whoami(PID)
    if (user !== "root") {
        return -1
    }

    try {
        const root = system.toDir(dir, c.getcwd(PID))
        system.processes[PID].token.root = String(root)
    } catch (e) {
        return -1
    }
    return 0
}

c.uname = (PID) => {
    return {
        "sysname": "Constellation",
        "release": "v0.5.0"
    };
};
c.sysinfo = (PID) => {
    return {
        "uptime": (Date.now() - sse.startTime) / 1000,
        "totalRam": performance.memory.jsHeapSizeLimit,
        "freeRam": performance.memory.jsHeapSizeLimit - performance.memory.totalJSHeapSize,
        "usedRam": performance.memory.totalJSHeapSize,
        "procs": Object.keys(system.processes).length
    }
}
c.gethostname = async (PID) => String(
    await system.fs.readFile("/System/info/hostname", "contents", "root")
)
c.sethostname = async (PID, hostname) => {
    try {
        await system.fs.writeFile("/System/info/hostname", hostname)
    } catch (e) {
        return -1
    }
    return 0
}

//c.shutdown = async function (PID) {
//    try {
//        await system.localFS.commit()
//    } catch(e) {
//        return -1
//    }
//    return 0
//}
c.reboot = async function (PID) {
    await system.localFS.commit()
    system.reboot()
    return 0
}

c.fullDirectory = (PID, location, relative) => {
    return system.toDir(location, relative);
};

system.memory.kernel.lib.messages = {};
const messages = system.memory.kernel.lib.messages;

system.memory.kernel.lib.PIDs = {};
const PIDs = system.memory.kernel.lib.PIDs;

c.send = function (PID, target, content) {
    if (messages[target] == undefined) {
        messages[target] = [];
    }

    messages[target].push({
        origin: PID,
        content: structuredClone(content),
        sent: Date.now()
    });
}
c.readMsgs = function (PID, deleteAfterRead) {

    if (messages[PID] == undefined) {
        messages[PID] = [];
    }

    const data = structuredClone(messages[PID]);

    if (deleteAfterRead == true) {
        messages[PID] = [];
    }

    return data
}
c.shout = function (PID, name) {
    system.debug(moduleName, `Process ${PID} has shouted as ${name}`)
    PIDs[PID] = name;
}
c.pidOfName = function (PID, name) {
    const keys = Object.keys(PIDs);
    const values = Object.values(PIDs);

    const valuesIndex = values.indexOf(name);

    return Number(keys[valuesIndex]);
}

c.claimDevice = (PID, deviceName) => {
    if (system.devices[deviceName] !== undefined) {
        system.devices[deviceName].owner = PID;

        //if (system.devices[deviceName].restartClaimers == true) {
        //    console.log("display claim requires restart")
        //    const startArgs = structuredClone(system.processes[PID].startProcArgs);
        //    if (startArgs[7].devices == undefined) {
        //        startArgs[7].devices = [];
        //    };
        //    startArgs[7].devices.push("display")
        //
        //    system.stopProcess(PID, false, false)
        //
        //    system.startProcess(...startArgs);
        //}

        system.log(moduleName, deviceName + " has been claimed by PID " + PID);
    } else {
        throw new Error("Device " + deviceName + " is not a valid device.");
    };
}

c.releaseDevice = (PID, deviceName) => {
    const dev = system.devices[deviceName];

    if (dev !== undefined) {
        if (dev.owner == PID) {
            dev.owner = 0
            system.log(moduleName, deviceName + " has been released from PID " + PID);
        }
    } else {
        throw new Error("Device " + deviceName + " is not a valid device.");
    };
};

c.deviceRope = async (PID, deviceName, ropeName, args = []) => {
    const dev = system.devices[deviceName]

    if (dev.owner !== PID) {
        throw new Error("You do not own device " + deviceName)
    }

    const log = (Name, content) => system.log(Name, content) // used within the ropes.

    const ropeResult = await dev.ropes[ropeName](...args);

    return ropeResult
}

c.deviceOwner = (PID, deviceName) => {
    return structuredClone(
        system.devices[deviceName].owner
    )
}




c.visible = (PID) => {
    return system.focus.includes(PID)
}
c.focused = (PID) => {
    return system.mainFcs === PID
}

c.getLibrary = async (PID, libName, appName) => {
    const libraryDirectories = [
        `/System/apps/libraries`
    ]

    for (const i in libraryDirectories) {
        const dir = libraryDirectories[i]

        let fileName = String(libName)
        fileName += ".js"
        const relative = system.toDir(fileName, dir)

        const content = await c.read(PID, relative)

        if (content !== undefined) {
            // found it!

            const proc = new system.process(0, relative, undefined, undefined, "root", "l")

            await new Promise((resolve) => {
                let interval = setInterval(() => {
                    if (proc.setup == true) {
                        clearInterval(interval)
                        resolve()
                    }
                })
            })

            return proc.rigging
        }
    }
    throw new Error("Library " + libName + " was not found on this system.")
}

c.mkusr = async (PID, name, obj) => {
    return system.registerUser(name, obj)
}