// write blank to a file

function init(args) {
    csw.fs.write(csw.fs.toDirectory(args[0]), "")
}