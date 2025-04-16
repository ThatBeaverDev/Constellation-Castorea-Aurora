#! /usr/bin/node

function init(args) {

    const dir = csw.fs.toDirectory(args[0], parent.dir)

    let location = dir.substring(0, dir.lastIndexOf("/"))
    if (location == "") {
        location = "/"
    }

    std.out = location
}