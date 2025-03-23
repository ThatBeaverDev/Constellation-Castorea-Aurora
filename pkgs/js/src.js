// run .js files

async function init(args) {
    csw.processes.execute(csw.fs.toDirectory(args[0]))
}