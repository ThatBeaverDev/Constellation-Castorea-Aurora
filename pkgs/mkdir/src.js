// Create Directories

function init(args) {
    if (args[0][0] == "/") {
        csw.fs.createDir(args[0])
    } else {
        let dir = csw.terminal.dir
        if (dir[dir.length - 1] !== "/") {
            dir += "/"
        }
        csw.fs.createDir(dir + args[0])
    }
}