// Restart System.

async function init(args) {

    const user = await call.whoami()
    if (user !== "root") {
        std.out = "[ERR]Reboot is only available to root."
        return
    }

    await system.localFS.commit()
    
    await system.reboot()
}