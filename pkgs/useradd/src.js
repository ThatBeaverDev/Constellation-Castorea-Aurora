// create system users

function init(args) {
    const system = csw.permissions.elevate()

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
        switch(args[i]) {
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
                if (i == args.length - 1) {
                    username = args[i]
                } else {
                    console.warn("Unknown flag: " + args[i])
                }
        }
    }
    obj.homeDir = (obj.homeDir || obj.baseDir + "/" + (username || ""))

    try {
        system.users.register(username, obj)
    } catch(e) {
        console.error("Error Creating User: " + e)
    }
}

// useradd -n user -h gjersiogjrs -p -p efgehwg