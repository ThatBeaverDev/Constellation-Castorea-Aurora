#! /usr/bin/node

// Change Directory


async function init(args) {
    const response = await parent.changeDir(args[0])
    if (response == undefined) {
        return
    }

    std.out = `[WRN]${response}`
}