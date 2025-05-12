#! /usr/bin/node

// Create Directories

async function init(args) {
    await call.mkdir(await call.fullDirectory(args[0], parent.dir))
}