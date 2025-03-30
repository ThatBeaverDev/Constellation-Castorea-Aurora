// CAT files


function init(args) {
    const dir = csw.fs.toDirectory(args[0], parent.dir)
    const content = csw.fs.read(dir)
    console.post(content)
}
