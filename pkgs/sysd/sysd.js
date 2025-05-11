// sysd

async function getServices(firstTime = false) {
    local.services = {}

    const companies = await call.readdir("/etc/sysd/system")

    for (const i in companies) {
        const company = companies[i]

        const services = await call.readdir("/etc/sysd/system/" + company)

        for (const j in services) {
            const data = await call.read("/etc/sysd/system/" + company + "/" + services[j])

            if (firstTime) {
                delete data.PID;
                delete data.ran;
            };

            local.services[company + "." + services[j]] = data;
        };
    };
};

async function init() {
    console.log("sysd starting.");

    local.shared = parent;
    local.aliases = {};
    local.starting = {};
    local.up = {};

    await getServices(true);

    setInterval(getServices, 15000);
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

async function frame() {

    const processes = await call.readdir("/proc");
    const users = await call.read("/etc/passwd");

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

    for (const i in users) {
        if (!users[i].sysdinit) {
            users[i].sysdinit = true
        }
    }

    getServices()
}