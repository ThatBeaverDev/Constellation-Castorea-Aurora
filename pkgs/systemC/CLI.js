function serviceInfo(name, inStack) {
    const services = local.systemC.variables.services
    for (const i in services) {
        if (i == name) {
            return services[i]
        }
    }

    if (inStack) {
        return undefined
    }

    // no process found

    const aliases = local.systemC.variables.aliases

    if (aliases[name] !== undefined) {
        return services[aliases[name]]
    }
}

function findSystemC(system) {
    const proc = system.processes
    const processes = Object.keys(proc)
    for (const i in processes) {
        const process = proc[processes[i]]
        if (process.name == "/usr/bin/systemc/systemC.js") {
            return process
        }
    }
}

function init(args) {
    const system = csw.permissions.elevate()

    local.options = {}
    local.options

    local.systemC = findSystemC(system)

    local.config = csw.fs.read("/etc/systemc/cfg.json")
    const config = local.config

    switch(args[0]) {
        case "status":

            if (args[1] == undefined) {
                break;
            }

            console.post(serviceInfo(args[1], false))
            break;
        case "start":
            console.log(config.services)
    }
}