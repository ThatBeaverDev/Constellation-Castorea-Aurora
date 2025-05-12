#! /usr/bin/node

// list  users.

async function init() {
    const users = await call.read("/etc/passwd")

    const keys = []

    for (const i in users) {
        if (typeof users[i] == "object") {
            keys.push(i)
        }
    }

    std.out = keys.join("\t")
}