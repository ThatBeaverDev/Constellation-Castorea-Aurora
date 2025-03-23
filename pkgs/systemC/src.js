// systemC

function init() {
    system.systemC = true
    system.constellinux.systemC = "v1"
    console.log("SystemC Found and Running.")
    var config = system.files.get("/etc/systemc.json")
    if (config === undefined) {
        console.log("no systemC config file found. creating one.")
        let obj = {}
        obj.creation = Date.now()
        obj.services = []
        obj.services.push({
            dir: "/bin/aquila.js",
            insure: true
        })
        obj.services.push({
            dir: "/usr/bin/crl/crl.js"
        })
        //obj.services.push({
        //    dir: "/usr/bin/cDesk/cDesk.js"
        //})
        obj.services.push({
            dir: "/usr/bin/welcome/welcome.js"
        })
        csw.fs.write("/etc/systemc.json",JSON.stringify(obj))
        console.log("Created blank systemC config file at /etc/systemc.json")
    }
    let services = JSON.parse(system.files.get("/etc/systemc.json")).services
    for (const i in services) {
        try {
            system.startProcess(services[i].dir, [], true)
            if (services[i].insure) {
                setTimeout(function () {
                    let process = false
                    for (const o in system.processes) {
                        if (system.processes[o].name == services[i].dir) {
                            process = true
                        }
                    }
                    if (!process) {
                        console.warn("Aquila failed to start, retrying...")
                        system.startProcess(services[i].dir, [], true)
                    }
                }, 500)
            }
        } catch(e) {
            console.error(e.stack)
        }
    }
}

function frame() {
}