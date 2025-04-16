// Change Directory


function init(args) {
    const response = parent.changeDir(args[0])
    if (response == undefined) {
        return
    }

    std.out = `[WRN]${response}`
}