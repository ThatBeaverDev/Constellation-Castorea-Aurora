const refetch = {
    "../aurora/pkgs/skylight/skylight/loginui.js": "/System/apps/gui/skylightLoginUI",
    "../aurora/pkgs/skylight/skylight/loginuiWallpaper.js": "/System/apps/gui/skylightLoginUIWallpaper",
    "../aurora/pkgs/nimbus/nimbus.js": "/System/apps/utils/nimbus"
}

for (const source in refetch) {

    const content = await system.fetchURL(source)

    await system.fs.writeFile(refetch[source], content, "root")

    console.warn("Updated " + source + ".")
}