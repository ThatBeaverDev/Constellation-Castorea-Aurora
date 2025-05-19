system.devices = {}

const identifierText = "#! /System/kernel/castoreaKernel.js:initDevice\n"

const devs = await system.fs.listFolder("/System/peripherals");
for (const i in devs) {
    const content = await system.fs.readFile("/System/peripherals/" + devs[i]);


    if (content.startsWith(identifierText)) {
        const dir = "/System/peripherals/" + devs[i]
        system.log(Name, "initDevice: " + dir);

        const dev = new system.asyncFunction("system", (await system.fs.readFile(dir)).textAfter(identifierText));

        const deviceData = await dev(system);

        system.devices[devs[i]] = {
            ropes: deviceData.ropes,
            owner: PID,
            restartClaimers: deviceData.restartClaimers == true
        }

        console.log(deviceData)
    };
};

for (const volume in system.volumes) {
    const volinf = system.volumes[volume]

    if (volinf.automount) {

    }
}

console.warn()