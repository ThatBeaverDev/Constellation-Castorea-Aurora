#! /usr/bin/node

// write blank to a file

async function init(args) {
    for (const i in args) {
        const dir = await call.fullDirectory(args[i], parent.dir)
        await call.write(dir, "")
    }
}