#! /System/apps/compilers/js

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function init() {
    local.sky = await call.pidOfName("skylightWindowSystem");
    await call.send(local.sky, {
        intent: "newWindow"
    });
    await call.send(local.sky, {
        intent: "renameWindow",
        text: "System Configuration"
    });

    const div = document.createElement("div")
    div.id = `ssmConfcontainer`

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: div.outerHTML
    })

    await sleep(100)

    local.container = document.getElementById(`ssmConfcontainer`)

    await refreshGUI("index")

    local.container.innerHTML = local.display
    console.trace(local.display)
}

async function refreshGUI(pagedir) {
    const dir = `/System/apps/gui/ssmconf/${pagedir}.html`
    const styles = "<style>" + await call.read("/System/apps/gui/ssmconf/styles.css") + "</style>"

    const page = await call.read(dir)

    local.display = page + "\n" + styles
}

function frame() {

}