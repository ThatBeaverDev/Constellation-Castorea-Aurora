#! /System/apps/compilers/js

// return the filename from a directory

function reverse(string) {
    return string.split("").reverse().join("")
}

async function init([dir, suffix = ""]) {

    const pth = await call.fullDirectory(dir, parent.dir)

    if (pth == "/") {
        std.out = "/"
        return
    }

    let path = pth

    if (path.at(-1) == "/") {
        path = path.substring(0, path.length - 1)
    }

    const basename = path.textAfterAll("/")
    std.out = basename

    if (suffix !== "") {
        const reversed = reverse(basename)
        const noSuffixReversed = reversed.textAfter(reverse(suffix))
        const noSuffix = reverse(noSuffixReversed)

        std.out = noSuffix
    }

    if (["", undefined, null, " "].includes(std.out)) {
        std.out = basename
    }
}