// Restart System.

async function init(args) {

    try {
        system
    } catch(e) {
        std.out = "[ERR]Reboot can only be ran by superuser."
        return
    }

    await system.localFS.commit()
    
    location.reload()
}