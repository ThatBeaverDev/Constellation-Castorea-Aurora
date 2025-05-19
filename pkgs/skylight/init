#! /System/apps/compilers/js

async function init() {

    call.shout("skyinit")

    const config = {
        main: await call.read("/System/config/skylight/main.json")
    }

    const subsystems = config.main.subsystems

    for (const i in subsystems) {
        try {
            await call.exec(subsystems[i], [], true);
        } catch(e) {
            console.warn(e)
        }
    }
}

function frame() {

}