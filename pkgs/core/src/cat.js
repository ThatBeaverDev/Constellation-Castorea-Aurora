// CAT files

function stringify(thing) {
    if (typeof thing == "object") {
        try {
            return JSON.stringify(thing, null, 4)
        } catch (e) {
            return {}
        }
    }
    return String(thing)
}

async function init(args) {

    if (args.length == 0) {
        return
    }

    const obj = {
        lineNumbers: false
    }

    let directory

    let flags = ""
    for (const i in args) {
        if (args[i][0] == "-") {
            const flag = String(args[i]).substring(1)
            flags += flag
        }
    }

    flags = flags.split("")

    // loop through parameters
    for (let i = 0; i < args.length; i++) {
        // check if the parameter is recognised
        switch (args[i][0]) {
            case "-":
                break;
            default:
                // if the token is the last one, it's the directory
                directory = args[i]
        }
    }

    for (const i in flags) {
        switch (flags[i]) {
            case "n":
                obj.lineNumbers = true
                break;
        }
    }

    const dir = await call.fullDirectory(directory, parent.dir)
    const fileContents = await call.read(dir)
    const content = stringify(fileContents)

    if (obj.lineNumbers) {
        const lines = content.split("\n")

        for (const i in lines) {
            lines[i] = `  ${i}\t${lines[i]}`
        }

        std.out += lines.join("\n")
    } else {
        std.out += content
    }
}
