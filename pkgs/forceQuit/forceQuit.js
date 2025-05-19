#! /System/apps/compilers/js

// force quit apps

async function refreshApps() {
    const proc = await call.readdir("/proc")
    local.processes = {}

    for (const i in proc) {
        local.processes[i] = await call.read("/proc/" + i + "/name")
    }
}

function row(thStyle, trStyle, ...items) {
    let row = `<tr class="forceQuit${PID}tr" style="${trStyle}">`

    const thStart = `<th class="forceQuit${PID}th" style="${thStyle}">`;
    const thEnd = "</th>";

    row += thStart + items.join(thEnd + "\n" + thStart) + thEnd

    row += "</tr>"

    return row
}

async function refreshGUI() {
    const table = document.createElement("table")

    const rowStyle = ""
    const cellStyle = ""

    table.innerHTML = row(cellStyle, rowStyle, "PID", "Name")

    let rows = 0
    for (const PID in local.processes) {
        rows++
        const name = local.processes[PID]

        let row = `<tr class="forceQuit${PID}tr" style="height: 35px;">`;

        row += `<th class="forceQuit${PID}th" style="width: 50px;">` + PID + "</th>"
        row += `<th class="forceQuit${PID}th" style="width: 150px;">` + name + "</th>"

        table.innerHTML += row
    }

    const rowHeight = 30

    table.style.width = "200px;"
    table.style.height = (rowHeight * rows) + "px"
    table.style.margin = "auto"

    return table.outerHTML
}

async function init() {

    local.sky = await call.pidOfName("skylightWindowSystem");

    await call.send(local.sky, {
        intent: "newWindow"
    })

    await refreshApps()

    local.ui = await refreshGUI()
}

async function frame() {
    const ui = await refreshGUI()

    if (ui !== local.ui) {
        local.ui = ui
    }

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: ui
    });
}