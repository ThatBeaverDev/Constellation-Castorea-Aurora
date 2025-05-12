// return system hostname

async function init(args) {
    std.out += await call.gethostname()
}