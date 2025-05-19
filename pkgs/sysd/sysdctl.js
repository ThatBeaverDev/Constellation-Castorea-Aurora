async function init(args) {
    local.options = {}
    local.options

    local.sysd = await call.pidOfName("sysd")

    local.config = await call.read("/System/config/systemC.json")
    const config = local.config

    const libmsg = await call.getLibrary("libmsg")

    let msg
    switch(args[0]) {
        case "status":
            msg = await libmsg.request(local.sysd, {
                intent: "serviceInfo",
                service: args[1]
            })

            const d = msg.content;

            std.out = `${args[1]} - ${d.desc}
    Loaded: ${d.entrypoint}
    Active: active (running) since ____________; _ weeks _ days ago
        Docs: _____
    Main PID: ${d.PID}
        Status: "running?????"
            Tasks: _
        Memory: ___K
            CPU: ___ms`


            
            break;
        case "start":
            break;
        case "stop":
            break;
        case "restart":
            break;

        case "list":
            msg = await libmsg.request(local.sysd, {
                intent: "listServices"
            });

            const list = msg.content;

            const formatted = list.join("\n");

            std.out = formatted;
            break;


        case "reboot":
            await call.send(local.sysd, {
                intent: "systemReboot"
            })
            break;

        default:
            std.out += `
    Managing Services:
        - sysdctl status [service]
        - sysdctl start [service]
        - sysdctl stop [service]
    
    Listing Services:
        - sysdctl list`
    }
}