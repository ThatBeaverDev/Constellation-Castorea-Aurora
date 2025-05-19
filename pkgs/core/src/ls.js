#! /System/apps/compilers/js

// LS
async function init(args) {

    const obj = {
        hidden: false,
        recursive: false,
        longFormat: false
    }

    let dir = parent.dir

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
                dir = args[i]
        }
    }

    for (const i in flags) {
        switch (flags[i]) {
            case "l":
                obj.longFormat = true
                break;
            case "a":
                obj.hidden = true
                break;
            case "r":
                obj.recursive = true
                break;
        }
    }

    let ls = []

    function insureIsCorrectLength(text, length) {
        let txt = text
        for (let go = false; go == false;) {
            txt += " "
            if (txt.length >= length) {
                go = true
            }
        }
        return txt
    }

    async function walk(directory) {
        const lis = await call.readdir(directory);

        for (const i in lis) {
            if (lis[i][0] == "." && obj.hidden == false) {
                continue;
            };

            let item = directory + "/" + lis[i];
            if (directory == "/") {
                item = directory + lis[i];
            };

            let isDir = false
            try {
                await call.readdir(item)
                isDir = true
            } catch(e) {}

            const log = [];
            if (obj.longFormat) {
                // if file is a directory, add - to the start of the line
                if (isDir) {
                    log.push("d")

                    log.push(" ")
                } else {
                    log.push("-")

                    log.push(" ")
                }

                log.push("   ")

                if (isDir) {
                    const size = insureIsCorrectLength("undefined", 10)
                    log.push(size)
                } else {
                    // file size
                    const size = insureIsCorrectLength(await call.read(item, "size"), 10)
                    log.push(size)
                }


                log.push("   ")

                // file name
                log.push(item)
            } else {
                // file name
                log.push(lis[i])
            }

            ls.push(log.join(""))

            if (isDir && obj.recursive) {
                await walk(item)
            }
        }
    }

    await walk(dir)

    std.out += ls.join("\n");
}