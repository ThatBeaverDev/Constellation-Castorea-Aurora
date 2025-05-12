// kill all processes with a set directory

async function init(args) {
    if (args[0] == undefined) {
        std.out = "usage: killall [processDirectory]\nYou must specify the process directory to kill."
        return
    }

    let toKill = []

    const procList = await call.readdir("/proc")

    // math the processes
    for (const i in procList) {
        const item = procList[i]
        if (await call.readdir("/proc/" + item + "/exe") == args[0]) {
            toKill.push(item)
        }
    }

    // kill the processes
    for (const i in toKill) {
        const item = toKill[i]
        await call.kill(item)
    }
}