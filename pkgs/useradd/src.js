// create system users

const users = csw.fs.read("/etc/passwd")

async function init(args) {

    try {
        system
    } catch(e) {
        std.out = "[ERR]Sudo is required to add users."
        return
    }

    const obj = {
        password: "default",
        groupID: undefined,
        otherInfo: {},
        baseDir: "/home",
        shell: "/bin/aquila.js",
        fullName: undefined
    }

    let username

    // loop through parameters
    for (let i = 0; i < args.length; i++) {
        // check if the parameter is recognised

        switch (args[i]) {
            case "--base-dir":
            case "-b":
                i++
                obj.baseDir = args[i]
                break;

            case "--comment":
            case "-c":
                i++
                obj.fullName = args[i]
                break;

            case "--dir":
            case "-d":
                i++
                obj.homeDir = args[i]
                break;

            case "--home":
            case "-d":
                i++
                obj.homeDir = args[i]
                break;

            case "--gid":
            case "-g":
                i++
                obj.groupID = args[i]
                break;

            case "--help":
            case "-h":
                // help command
                return

            case "--password":
            case "-p":
                i++
                obj.password = args[i]
                break;

            case "--shell":
            case "-s":
                i++
                obj.shell = args[i]
                break;

            default:
                // if the token is the last one, it's the username
                if (args[i][0] == "-") {
                    std.out = "[WRN]Unknown flag: " + args[i]
                } else {
                    username = args[i]
                }
        }
    }

    if (username == undefined) {
        std.out = "[ERR]Username not specified."
        throw new Error("Username not specified.")
    }

    obj.homeDir = (obj.homeDir || obj.baseDir + "/" + (username || ""))

    try {
        await register(username, obj)
    } catch (e) {
        throw new Error("Creating User: " + e)
        //return
    }
}

const register = async function (name, object) {

    const obj = JSON.parse(JSON.stringify(object))

    if (users[name] !== undefined) {
        throw new Error("user named " + name + " already exists!")
    }

    obj.userID = users.amount
    if (obj.password == undefined) {
        std.out += "[WRN]User password was not defined: it is set to 'default'"
        obj.password = "default"
    }
    obj.password = await system.userPasswordHash(obj.password);

    if (obj.permissions == undefined) {
        obj.permissions = {}
    }
    const p = obj.permissions
    p.all = (p.all || false)
    p.read = (p.read || false)
    p.write = (p.write || false)
    p.delete = (p.delete || false)

    users[name] = obj
    if (!csw.fs.isDirectory(obj.baseDir)) {
        throw new Error(`User base directory (${obj.baseDir}) is not created`)
    } else {
        const d = obj.homeDir
        csw.fs.createDir(d)
        csw.fs.createDir(d + "/.profile")
        csw.fs.createDir(d + "/.config")
    }

    return true
}