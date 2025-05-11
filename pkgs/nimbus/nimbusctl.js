#! /usr/bin/node

function init([command, data1, data2]) {
    switch (command) {
        case "wallpaper":
            const nimbus = call.pidOfName("nimbusDE");
            call.send(nimbus, {
                intent: "wallpaperSet",
                wallpaper: data1
            })
            break;
        default:
            std.out = `[ERR]Unknown Command: ${command}`
            return
    }
}