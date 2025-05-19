#! /System/apps/compilers/js

function init([dir = "all"]) {
    const system = csw.permissions.elevate()

    let disk

    switch(dir) {
        case "all":
            const vfs = system.vfs

            for (const i in vfs) {
                disk += JSON.stringify( system.fs.getVFS(i).vfs )
            }

            break;
        default:
            disk = JSON.stringify( system.fs.getVFS(dir).vfs )

    }

    const byteSize = str => new Blob([str]).size;

    let diskSize = byteSize(disk)

    let unit = 1

    while (diskSize > 1024) {
        unit++
        diskSize /= 1024
    }

    let formatted = String(Math.round(diskSize * 100) / 100)
    switch (unit) {
        case 1:
            formatted += "Bytes"
            break;
        case 2:
            formatted += "KiB"
            break;
        case 3:
            formatted += "MiB"
            break;
        case 4:
            formatted += "GiB"
            break;
        case 5:
            formatted += "TiB"
            break;
    }

    std.out = `Disk Usage for ${dir}: ${formatted}`
}