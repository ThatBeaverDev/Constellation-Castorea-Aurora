// systemC

const processes = system.processes

function getServices(firstTime = false) {
    local.services = {}

    const companies = csw.fs.listDir("/etc/systemc/system")

    for (const i in companies) {
        const company = companies[i]

        const services = csw.fs.listDir("/etc/systemc/system/" + company)

        for (const j in services) {
            const data = csw.fs.read("/etc/systemc/system/" + company + "/" + services[j])

            if (firstTime) {
                delete data.PID
                delete data.ran
            }

            local.services[company + "." + services[j]] = data
        }
    }
}

async function init() {
    system.systemC = true
    system.versions.systemC = "v1"
    console.log("systemC starting.")

    local.shared = parent
    local.aliases = {},
    local.starting = {},
    local.up = {},

    getServices(true)

    setInterval(getServices, 5000)
}

local.startService = async function startService(name) {

    if (local.starting[name] == true) {
        return
    }

    local.starting[name] = true

    const service = local.services[name]
    if (service.waitFor !== undefined) {
        if (local.up[service.waitFor] !== true) {
            local.starting[name] = false
            return false
        }
    }

    const entrypoint = service.entrypoint

    const start = await system.startProcess(PID, entrypoint, [], true)

    service.PID = start.PID
    console.log(`Service ${name} has been started`)
    service.PID = String(service.PID)
}

async function frame() {
    const processesKeys = Object.keys(processes)

    // make sure the required services are running
    for (const i in local.services) {
        if (i == undefined) continue;
        const service = local.services[i]

        if (processesKeys.includes(service.PID)) {
            local.up[i] = true
        } else {
            local.up[i] = false
        }

        switch(service.restart) {
            case "always":
                if (local.up[i] == true) {
                    // it's running
                } else {
                    local.startService(i)
                }
                break;
            case "once":
                if (service.ran !== true) {
                    service.ran = true
                    local.startService(i)
                }
                break;
        }
    }

    for (const i in system.users) {
        if (!system.users[i].systemCinit) {
            system.users[i].systemCinit = true
        }
    }

    getServices()
}