// kill all processes with a set directory

function init(args) {
    const system = csw.permissions.elevate()

    if (args[0] == undefined) {
        std.out = "usage: killall [processDirectory]\nYou must specify the process directory to kill."
        return
    }

    let toKill = []

    // math the processes
    for (const i in system.processes) {
        if (system.processes[i].name == args[0]) {
            toKill.push(i)
        }
    }

    // kill the processes
    for (const i in toKill) {
        system.stopProcess(i)
    }
}