#! /System/apps/compilers/js

// skylight window server

async function createWindow(PID) {
    const procname = await call.read("/proc/" + PID + "/cmdline")

    const title = document.createElement("p")
    title.id = `skylightWindow${PID}title`
    title.className = `skylightWindowTitle`
    title.innerText = `${procname}`

    class headerButton {
        constructor(imageSRC, id = "button") {
            this.elem = document.createElement("div")
            const e = this.elem
            e.className = "skylightWindowButton"
            e.style.width = "25px";
            e.style.height = "25px";
            e.id = `skylightWindowButton${PID}-${id}`

            if (imageSRC !== undefined) {
                const img = document.createElement("img")
                img.src = imageSRC;
                img.style.width = "100%";
                img.style.height = "100%";
                img.className = "skylightWindowButtonImage"
                img.id = `skylightWindowButton${PID}-${id}-svg`

                e.innerHTML = img.outerHTML;
            }
        }
    }

    system.focus.push(PID)

    const systemButtons = {
        box: await call.read("§/icons/box.svg"),
        close: await call.read("§/icons/close.svg"),
        minimise: await call.read("§/icons/minimise.svg")
    }

    const buttons = {
        box: new headerButton(systemButtons.box, "box").elem.outerHTML,
        close: new headerButton(systemButtons.close, "close").elem.outerHTML,
        //minimise: new headerButton(systemButtons.minimise, "minimise").elem.outerHTML
    }

    const top = document.createElement("div")
    top.id = `skylightWindow${PID}top`;
    top.innerHTML = title.outerHTML + buttons.close + buttons.box// + buttons.minimise;
    top.className = "skylightTop"

    const body = document.createElement("div")
    body.id = `skylightWindow${PID}body`;
    body.className = "skylightBody"

    const total = document.createElement("div")
    total.id = `skylightWindow${PID}`;
    total.className = "skylightTotal"
    total.innerHTML = top.outerHTML + "\n" + body.outerHTML;

    const width = 750
    const height = 500

    const leftPx = (window.innerWidth - width) / 2
    const topPx = (window.innerHeight - height) / 2

    total.style.width = width + "px";
    total.style.height = height + "px";

    // for window movement
    total.left = leftPx;
    total.style.left = total.left + "px"
    total.top = topPx;
    total.style.top = total.top + "px";

    local.display.appendChild(total);

    local.windows[PID] = {
        top: document.getElementById(top.id),
        body: document.getElementById(body.id),
        total: document.getElementById(total.id),
        title: document.getElementById(title.id),
        box: document.getElementById(`skylightWindowButton${PID}-box`),
        boxSvg: document.getElementById(`skylightWindowButton${PID}-box-svg`),
        close: document.getElementById(`skylightWindowButton${PID}-close`),
        closeSvg: document.getElementById(`skylightWindowButton${PID}-close-svg`),
        //minimise: document.getElementById(`skylightWindowButton${PID}-minimise`),
        //minimiseSvg: document.getElementById(`skylightWindowButton${PID}-minimise-svg`)
    };

    // close button
    local.windows[PID].closeSvg.addEventListener("click", async function () {
        await call.kill(PID);
    });

    local.windows[PID].boxSvg.title = "box"

    // box button
    local.windows[PID].boxSvg.addEventListener("click", function () {
        // code here
    });

    local.windows[PID].boxSvg.addEventListener("mouseenter", async function () {
        const box = local.windows[PID].boxSvg;
        box.dataset.hover = "true";

        const interval = setInterval(function () {
            if (box.dataset.hover !== "true") {
                clearInterval(interval)
                return
            }
        }, 0)
    });

    local.windows[PID].boxSvg.addEventListener("mouseleave", async function () {
        const box = local.windows[PID].boxSvg;
        box.dataset.hover = false;
    });

    // minimise button
    //local.windows[PID].minimiseSvg.addEventListener("click", function () {
    // code here
    //});    

    system.mainFcs = PID;

    local.windows[PID].total.addEventListener("mouseenter", function () {
        system.mainFcs = PID;
    })

    const appWindow = local.windows[PID];
    appWindow.top.addEventListener('mousedown', (event) => {
        switch (String(event.button)) {
            case "0": // left (main) click
                if (local.drag !== undefined) {
                    return
                }
                local.drag = PID
                break;
            case "1": // middle click
                break;
            case "2": // right click
                break;
            default:
        }
    });
}

function closeWindow(PID) {

    if (local.windows[PID] == undefined) {
        return;
    }

    local.windows[PID].total.remove() // remove window elements

    system.focus.splice(system.focus.indexOf(PID), 1) // remove from focus list

    delete local.windows[PID] // delete the window object
}

async function init() {

    const PID = await call.getpid()

    await call.claimDevice("display")

    system.focus = [];

    local.displays = {};
    local.windows = {};

    local.drag = undefined;

    local.display = document.getElementById("display");
    local.display.style.overflow = "hidden";
    local.display.innerHTML = `<div id="skylightContextBox"></div>`;

    local.contextBox = document.getElementById("skylightContextBox");

    const style = document.createElement("style");
    style.textContent = await call.read("§/apps/data/skylight/styles.css");
    document.body.appendChild(style);

    document.addEventListener('mousemove', (event) => {

        if (local.xDiff !== 0 || local.yDiff !== 0) {
            return;
        };

        local.oldmsX = Number(local.msX);
        local.oldmsY = Number(local.msY);

        local.msX = Number(event.clientX);
        local.msY = Number(event.clientY);

        local.xDiff = Number(local.msX) - Number(local.oldmsX);
        local.yDiff = Number(local.oldmsY) - Number(local.msY);
    })

    document.addEventListener('mouseup', (event) => {
        local.drag = undefined;
    });

    await call.shout("skylightWindowSystem");
};

async function frame() {

    system.fcs = system.focus;

    if (local.drag !== undefined) {
        const total = local.windows[local.drag].total
        total.left += local.xDiff
        total.style.left = total.left + "px"

        total.top -= local.yDiff
        total.style.top = total.top + "px"
    }

    const PIDs = await call.readdir("/proc")

    for (const i in local.windows) {
        if (!PIDs.includes(i)) {
            closeWindow(i)
        }
    }

    local.xDiff = 0;
    local.yDiff = 0;





    const msgs = await call.readMsgs(true)

    for (const i in msgs) {

        const msg = msgs[i]
        const data = msg.content

        if (typeof data !== "object") {
            continue;
        }

        let associations
        switch (data.intent) {
            case "newWindow":
                await createWindow(msg.origin);
                console.debug("window created for PID " + msg.origin)
                break;
            case "moveWindow":
                local.windows[msg.origin].total.left = Number(data.left);
                local.windows[msg.origin].total.style.left = `${data.left}px`;
                local.windows[msg.origin].total.top = Number(data.top);
                local.windows[msg.origin].total.style.top = `${data.top}px`;

                if (data.zIndex !== undefined) {
                    local.windows[msg.origin].total.style.zIndex = String(data.zIndex);
                };
                break;
            case "closeWindow":
                closeWindow(msg.origin);
                break;
            case "resizeWindow":
                const width = data.width + "px"
                const height = data.height + "px"
                if (local.windows[msg.origin].total.style.width !== width) {
                    local.windows[msg.origin].total.style.width = width
                }
                if (local.windows[msg.origin].total.style.height !== height) {
                    local.windows[msg.origin].total.style.height = height
                }
                break;
            case "setWindowContents":
                local.windows[msg.origin].body.innerHTML = data.contents;
                break;
            case "renameWindow":
                local.windows[msg.origin].title.innerText = data.text
                break;

            case "isVisible":
                const visible = local.windows[msg.origin] !== undefined

                console.warn(msg)

                await call.send(msg.origin, {
                    intent: "skylightResponse",
                    data: visible,
                    isResponse: true
                })

                break;
            case "getMainFcs":
                await call.send(msg.origin, {
                    intent: "skylightResponse",
                    data: structuredClone(system.mainFcs)
                })
                break;

            case "claimFiletype":

                //{
                //    intent: "claimFileType",
                //    type: "png",
                //    entrypoint: "§/apps/utils/pngapp"
                //}

                associations = await call.read("§/apps/data/skylight/filetypes.json")
                if (associations == undefined) {
                    associations = {}
                }

                associations[data.type] = data.entrypoint

                await call.write("§/apps/data/skylight/filetypes.json", association)
                break;
            case "openFile":
                associations = await call.read("§/apps/data/skylight/filetypes.json")
                if (associations == undefined) {
                    continue;
                }

                const type = data.directory.textAfterAll(".")
                const app = associations[type]

                await call.exec(app, [], msg.directory, false)

                break;
            default:
                console.error(`Process ${msg.origin} has attempted to manipulate a window with key '${data.intent}, which is not recognised.`)
        }
    }


}