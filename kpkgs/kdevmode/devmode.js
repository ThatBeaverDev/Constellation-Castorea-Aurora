return

const refetch = {
    "http://localhost:5079/pkgs/skylight/skylight/loginui.js": "/System/apps/gui/skylightLoginUI",
    "http://localhost:5079/pkgs/skylight/skylight/loginuiWallpaper.js": "/System/apps/gui/skylightLoginUIWallpaper",
    "http://localhost:5079/kpkgs/kcalls/calls.js": "/System/kernel/modules/calls,js",
    "http://localhost:5079/pkgs/aquila/src.js": "/System/apps/utils/aquila.js",
}

for (const source in refetch) {

    const content = await system.fetchURL(source)

    await system.fs.writeFile(refetch[source], content, "root")

    console.warn("Updated " + source + ".")
}