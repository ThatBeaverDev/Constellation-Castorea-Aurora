#! /System/apps/compilers/js

// list  users.

async function init() {
    const users = await call.read("/System/users.json")

    const keys = []

    for (const i in users) {
        if (typeof users[i] == "object") {
            keys.push(i)
        }
    }

    std.out = keys.join("\t")
}