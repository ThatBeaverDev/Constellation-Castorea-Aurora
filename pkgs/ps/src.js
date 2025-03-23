// list processes

function init(args) {
    const system = csw.permissions.elevate()

    let data = "PID - NAME\n"
    for (const i in system.processes) {
        try {
        const item = system.processes[i]
        data += item.PID + " - " + item.name + "\n"
        } catch(e) {}
    }
    console.post(data)
}