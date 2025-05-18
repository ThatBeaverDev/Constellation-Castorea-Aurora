const refetch = {
    "../aurora/pkgs/skylight/skylight/loginui.js": "/usr/lib/skylight/loginui",
    "../aurora/pkgs/skylight/skylight/loginuiWallpaper.js": "/usr/lib/skylight/loginuiWallpaper",
    "../aurora/pkgs/nimbus/nimbus.js": "/usr/bin/nimbus"
}

for (const source in refetch) {

    const content = await system.fetchURL(source)

    await system.fs.writeFile(refetch[source], content, "root")

    console.warn("Updated " + source + ".")
}