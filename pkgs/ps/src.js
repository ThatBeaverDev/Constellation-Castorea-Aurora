// list processes

function init(args) {
    //const pcs = csw.fs.read("/proc")
    const pcs = csw.permissions.elevate().processes

    const PIDLen = []
    const pathLen = []
    const userLen = []

    for (const i in pcs) {
        PIDLen.push(String(i).length)
        pathLen.push(String(pcs[i].name).length)
        userLen.push(String(pcs[i].token.user).length)
    }

    const longestPID = Math.max("PID".length, ...PIDLen)
    const longestPath = Math.max("DIR".length, ...pathLen)
    const longestUser = Math.max("DIR".length, ...userLen)

    let data = "PID - USER - CMD\n"
    for (const i in pcs) {
        if (i == -1) {
            continue;
        }

        try {
            const item = pcs[i]
            let PID = String(item.PID)
            let user = String(item.token.user)
            let path = String(item.name)

            PID.padStart(longestPID, "0")
            user.padEnd(longestUser, " ")
            path.padEnd(longestPath, " ")

            data += PID + " - " + user + " - " + path + "\n"
        } catch (e) {}
    }

    std.out = data;
}