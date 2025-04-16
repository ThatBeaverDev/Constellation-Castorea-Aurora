// systemC

const processes = csw.fs.read("/proc")

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
                console.debug(data)
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
    local.aliases = {}

    getServices(true)

    setInterval(getServices, 5000)
}

local.startService = async function startService(name) {
    const service = local.services[name]
    if (service.waitFor !== undefined) {
        if (local.up[service.waitFor] == false) {
            return false
        }
    }

    const entrypoint = service.entrypoint

    const start = await system.startProcess(PID, entrypoint, [], true)

    service.PID = start.PID
    console.log(`Service ${name} has been started`)
    service.PID = String(service.PID)
}

function frame() {
    const processesKeys = Object.keys(processes)

    local.up = {}

    // make sure the required services are running
    for (const i in local.services) {
        if (i == undefined) continue;
        const service = local.services[i]

        switch(service.restart) {
            case "always":
                if (processesKeys.includes(service.PID)) {
                    local.up[i] = true
                    // it's running
                } else {
                    local.up[i] = false
                    local.startService(i)
                }
                break;
            case "once":
                if (!service.ran) {
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