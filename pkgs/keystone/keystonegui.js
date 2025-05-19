#!/System/js

// keystone search frontend

const getSearchResult = async (text) => {
    const data = await call.exec("/System/apps/utils/keystone", ["search", text])

    const output = data.stdout

    return output
}

async function init() {
    local.sky = await call.pidOfName("skylightWindowSystem");

    await call.send(local.sky, {
        intent: "newWindow"
    });

    const width = 350
    const height = 250

    await call.send(local.sky, {
        intent: "moveWindow",
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
        zIndex: "100"
    });
    await call.send(local.sky, {
        intent: "resizeWindow",
        width: 350,
        height: 250
    });
    await call.send(local.sky, {
        intent: "renameWindow",
        text: "Keystone Search"
    });

    const inputBox = document.createElement("input");
    inputBox.id = `keystoneSearch${PID}input`
    inputBox.style.width = "100%";
    inputBox.style.height = "25px";
    inputBox.style.border = "None";
    inputBox.style.outline = "None";
    inputBox.style.background = "transparent";
    inputBox.style.color = "white";

    const results = document.createElement("p");
    results.id = `keystoneSearch${PID}results`
    results.style.width = "100%"
    results.style.height = "100%"
    results.innerText = "Type something to search!"

    const gui = document.createElement("div");
    gui.id = `keystoneSearch${PID}total`
    gui.innerHTML = inputBox.outerHTML + "\n" + results.outerHTML;
    gui.style.width = "100%";
    gui.style.height = "100%";

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: gui.outerHTML
    });

    await new Promise((resolve) => {
        setTimeout(resolve, 10)
    })

    local.elements = {
        total: document.getElementById(`keystoneSearch${PID}total`),
        input: document.getElementById(`keystoneSearch${PID}input`),
        results: document.getElementById(`keystoneSearch${PID}results`)
    };

    document.getElementById(`keystoneSearch${PID}results`).focus()

    const i = local.elements.input;

    i.addEventListener("keyup", async (event) => {
        const text = i.value

        const searchResults = await getSearchResult(text)

        document.getElementById(`keystoneSearch${PID}results`).innerText = String(searchResults)
    });
}

async function frame() {
    if (await call.focused() == true) {
        document.getElementById(`keystoneSearch${PID}results`).focus()
    }
}