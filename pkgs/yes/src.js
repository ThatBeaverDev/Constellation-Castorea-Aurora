// spam whatever was entered (i have no idea why this is necessary)

function init(args) {
    local.yes = args[0]
}

function frame() {
    console.post(local.yes)
}