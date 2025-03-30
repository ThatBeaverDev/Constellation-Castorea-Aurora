// return username

function init() {
    const system = csw.permissions.elevate()

    console.post(system.user)
}