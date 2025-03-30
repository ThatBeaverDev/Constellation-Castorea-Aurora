// systemC

function getServices() {
    local.services = {}

    const companies = system.fs.rawFolder("/etc/systemc/system").list()

    for (const i in companies) {
        const company = companies[i]

        const services = system.fs.rawFolder("/etc/systemc/system/" + company).list()

        for (const j in services) {
            const data = system.fs.readFile("/etc/systemc/system/" + company + "/" + services[j])
            const lines = data.split("\n")
            let segment

            local.services[company + "." + services[j]] = {}
            const service = local.services[company + "." + services[j]]
            service.unit = {}
            service.service = {}

            for (const k in lines) {
                const line = lines[k]

                if (line == "") {
                    continue;
                }

                if (line[0] == "[" && line.at(-1) == "]") {
                    segment = line.substring(1, line.length - 1)
                    continue;
                }

                let pre = line.substring(0, line.indexOf("="))
                let post = line.substring(line.indexOf("=") + 1, Infinity)

                switch(segment) {
                    case "Unit":
                        service.unit[pre] = post
                        break;
                    case "Service":
                        service.service[pre] = post
                        break;
                    default:
                        console.error(`Unknown Segment: ${ segment }`)
                }
            }

            const serviceName = services[j].substring(0, services[j].indexOf("."))

            if (local.aliases[serviceName] == undefined) {
                local.aliases[serviceName] = company + "." + services[j]
            } else {
                local.aliases[serviceName] = 'Multiple Options'
            }

            console.log(service)
        }
    }
}

async function init() {
    system.systemC = true
    system.versions.systemC = "v1"
    console.log("SystemC Found and Running.")

    local.shared = parent
    local.aliases = {}

    if (system.fs.readFile("/etc/systemc/cfg.json") === undefined) {
        console.log("no systemC config file found. creating one.")
        let obj = {}
        obj.creation = Date.now()
        obj.services = []

        obj.services.wrapper = {
            dir: "/lib/systemWrapper.js",
            insure: true
        }

        obj.services.aquila = {
            dir: "/bin/aquila.js",
            insure: true
        }

        obj.services.crl = {
            dir: "/usr/bin/crl/crl.js"
        }

        system.fs.writeFile("/etc/systemc/cfg.json", obj)
        console.log("Created default systemC config file at /etc/systemc/cfg.json")
    }

    getServices()
}

local.startService = async function startService(name) {
    const service = local.services[name]

    const startBinary = service.service.ExecStart

    service.PID = await system.startProcess(PID, startBinary, [], true)
    service.PID = String(service.PID)
}

function frame() {
    const processes = Object.keys(system.processes)

    local.up = {}

    // make sure the required services are running
    for (const i in local.services) {
        if (i == undefined) continue;
        const service = local.services[i]

        if (service.unit.Restart == "always") {
            if (processes.includes(service.PID)) {
                local.up[i] = true
                // it's running
            } else {
                local.up[i] = false
                local.startService(i)
                console.log(`Service ${ i } has been started`)
            }
        }
    }

    for (const i in system.users) {
        if (!system.users[i].systemCinit) {
            system.users[i].systemCinit = true
        }
    }
}