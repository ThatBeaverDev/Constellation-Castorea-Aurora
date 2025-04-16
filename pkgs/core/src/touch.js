// write blank to a file

function init(args) {
    for (const i in args) {
        const dir = csw.fs.toDirectory(args[i], parent.dir)
        csw.fs.write(dir, "")
    }
}