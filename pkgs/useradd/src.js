// create system users


async function init(args) {
    try {
        system
    } catch (e) {
        std.out = "[ERR]Sudo is required to add users."
        return
    }

    const obj = {
        password: "default",
        groupID: undefined,
        otherInfo: {},
        baseDir: "/Users",
        shell: "/System/apps/utils/aquila.js",
        desktopenv: "/System/apps/gui/nimbus.js",
        image: "/System/icons/defaultUser.jpg",
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

    await call.mkusr(username, structuredClone(obj))

    await call.chusr(username, obj.password)

    const base = obj.homeDir

    const places = [
        "./Desktop",
        "./Documents",
        "./Media",
        "./Media/Music",
        "./Media/Photos",
        "./Media/Photos/Wallpapers",
        "./Media/Videos",
        "./Media/Videos/Wallpapers",
        "./.System",
        "./.System/apps",
        "./.System/apps/background",
        "./.System/apps/gui",
        "./.System/apps/libraries",
        "./.System/apps/utils",
        "./Config",
    ]

    for (const i in places) {
        const dir = await call.fullDirectory(places[i], base)

        await call.mkdir(dir)
    }
}