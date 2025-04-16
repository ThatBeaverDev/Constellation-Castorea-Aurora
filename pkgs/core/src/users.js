#! /usr/bin/node

// list  users.

function init() {
    const users = csw.fs.read("/etc/passwd")

    const keys = []

    for (const i in users) {
        if (typeof users[i] == "object") {
            keys.push(i)
        }
    }

    std.out = keys.join("\t")
}