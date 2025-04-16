// return system hostname

function init(args) {
    std.out += csw.fs.readFile("/etc/hostname")
}