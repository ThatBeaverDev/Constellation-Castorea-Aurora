// terminate processes

async function init(args) {
    await call.kill(args[0])
}