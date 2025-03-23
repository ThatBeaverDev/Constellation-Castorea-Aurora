// LS

function init(args) {
    console.post(csw.fs.listDir((args[0] || csw.terminal.dir)).join(",   "))
}