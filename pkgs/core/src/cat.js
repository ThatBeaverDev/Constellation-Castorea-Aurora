// CAT files

function stringify(thing) {
    if (typeof thing == "object") {
        try {
            return JSON.stringify(thing)
        } catch (e) {
            return {}
        }
    }
    return String(thing)
}

function init(args) {
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

    const dir = csw.fs.toDirectory(directory, parent.dir)
    const content = stringify(csw.fs.read(dir))

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
