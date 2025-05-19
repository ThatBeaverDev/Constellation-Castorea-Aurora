#! /System/apps/compilers/js

async function init(args) {

    const dir = await call.fullDirectory(args[0], parent.dir)

    let location = dir.substring(0, dir.lastIndexOf("/"))
    if (location == "") {
        location = "/"
    }

    std.out = location
}