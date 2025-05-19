// sysd

async function getServices(firstTime = false) {
    local.services = {}

    const services = await call.readdir("/System/services")

    for (const j in services) {
        const data = await call.read("/System/services/" + services[j])

        if (firstTime) {
            delete data.PID;
            delete data.ran;
        };

        local.services[services[j]] = data;
    };
};

async function init() {
    console.log("sysd starting.");

    await call.shout("sysd")

    local.shared = parent;
    local.aliases = {};
    local.starting = {};
    local.up = {};

    await getServices(true);
    await insureRunning()

    local.interval = setInterval(async () => {
        await getServices()
        await insureRunning()
    }, 15000);
}

local.startService = async function startService(name) {

    if (local.starting[name] == true) {
        return;
    };

    local.starting[name] = true;

    const service = local.services[name];
    if (service.waitFor !== undefined) {
        if (local.up[service.waitFor] !== true) {
            local.starting[name] = false;
            return false;
        };
    };

    const entrypoint = service.entrypoint;

    const start = await call.exec(entrypoint, []);

    service.PID = start.PID;
    console.log(`Service ${name} has been started`);
    service.PID = String(service.PID);
}

function empty(object) {
    for (const i in object) {
        delete object[i]
    }
}

async function insureRunning() {
    const processes = await call.readdir("/proc");

    const processesKeys = Object.keys(processes);

    // make sure the required services are running
    for (const i in local.services) {
        if (i == undefined) continue;
        const service = local.services[i]

        if (processesKeys.includes(service.PID)) {
            local.up[i] = true
        } else {
            local.up[i] = false
        }

        switch (service.restart) {
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
}

async function frame() {

    const msgs = await call.readMsgs(true)

    for (const i in msgs) {
        const msg = msgs[i]
        const payload = msg.content

        switch (payload.intent) {
            case "listServices":
                await call.send(msg.origin, Object.keys(local.services))
                break;
            case "serviceInfo":
                await call.send(msg.origin, local.services[payload.service])
                break;
            case "startService":
                break;
            case "stopService":
                break;
            case "systemReboot":
                console.log(system.processes)
                for (const i in system.processes) {
                    if (i == 0) continue;
                    try {
                        await system.stopProcess(i, true, true)
                    } catch (e) {
                        console.warn("Terminating " + i + ":", e)
                    }
                }

                for (const i in system.processes) {
                    if (i == 0) continue;
                    delete system.processes[i]
                }

                empty(system.memory.kernel.lib.messages)
                empty(system.memory.kernel.lib.PIDs)
                system.maxPID = 0

                system.log(Name, "Rebooting init system...")
                const init = system.fs.readFile("/System/init.js")
                await system.startProcess(0, init, [], undefined, "root", false, { type: "k" })

                console.log(system.processes)
                break;
        }
    }
}

function terminate() {
    clearInterval(local.interval)
}