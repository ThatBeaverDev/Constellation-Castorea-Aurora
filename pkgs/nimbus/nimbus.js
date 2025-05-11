#! /usr/bin/node

// nimbus desktop environment

async function init() {

    if (!isNaN(await call.pidOfName("nimbusDE"))) {
        console.error("nimbusDE is already running - if you meant to access nimbus configuration, run nimbusctl.")
        std.out = "[ERR]nimbusDE is already running - if you meant to access nimbus configuration, run nimbusctl."
        await call.kill(".")
        return
    }

    await call.shout("nimbusDE");

    await new Promise(function (resolve) {
        setTimeout(resolve, 100);
    });

    local.contextBox = document.getElementById("nimbusContextBox");

    local.sky = await call.pidOfName("skylightWindowSystem");
    await call.send(local.sky, {
        intent: "newWindow"
    });

    async function correctWallpaperPosition() {
        await call.send(local.sky, {
            intent: "moveWindow",
            left: 0,
            top: -10,
            zIndex: "-100"
        });
        await call.send(local.sky, {
            intent: "resizeWindow",
            width: window.innerWidth,
            height: (window.innerHeight + 10)
        });
    }

    local.innerWidth = Number(window.innerWidth)
    local.innerHeight = Number(window.innerHeight)
    local.correctWallpaperPosition = correctWallpaperPosition
    correctWallpaperPosition()

    const style = document.createElement("style")
    style.textContent = await call.read("/usr/share/nimbus/styles.css")
    document.body.appendChild(style)

    // left side buttons

    const constellationButton = document.createElement("button");
    constellationButton.id = "nimbusHeaderButton-Constellation";
    constellationButton.classList = "nimbusHeaderInner nimbusHeaderInnerWithinDropdown";
    constellationButton.innerText = "∆";

    const constellationDropdown = document.createElement("div");
    constellationDropdown.id = "nimbusHeaderDropdown-Constellation";
    constellationDropdown.className = "nimbusHeaderInner";
    constellationDropdown.innerHTML = constellationButton.outerHTML;

    const systemButton = document.createElement("button");
    systemButton.id = "nimbusHeaderButton-System"
    systemButton.innerText = "System";
    systemButton.className = "nimbusHeaderInner";

    /*const filesButton = document.createElement("button");
    filesButton.id = "nimbusHeaderButton-Files"
    filesButton.innerText = "Files";
    filesButton.className = "nimbusHeaderInner";*/

    const terminalButton = document.createElement("button");
    terminalButton.id = "nimbusHeaderButton-Terminal"
    terminalButton.innerText = "Terminal"
    terminalButton.className = "nimbusHeaderInner"

    const libraryButton = document.createElement("button");
    libraryButton.id = "nimbusHeaderButton-Library";
    libraryButton.innerText = 'Library';
    libraryButton.className = "nimbusHeaderInner";

    const settingsButton = document.createElement("button");
    settingsButton.id = "nimbusHeaderButton-Settings"
    settingsButton.innerText = "Settings";
    settingsButton.className = "nimbusHeaderInner";

    const packagesButton = document.createElement("button");
    packagesButton.id = "nimbusHeaderButton-Packages";
    packagesButton.innerText = "Packages";
    packagesButton.className = "nimbusHeaderInner";

    // right side buttons
    const timeDisplay = document.createElement("button");
    timeDisplay.innerText = "07:46:04   04/03/2025";
    timeDisplay.className = "nimbusHeaderInnerRight";
    timeDisplay.id = "nimbusTimeDisplay";

    const leftHTML = constellationDropdown.outerHTML + "\n" + systemButton.outerHTML + "\n" + /*filesButton.outerHTML + "\n" + */terminalButton.outerHTML + "\n" + libraryButton.outerHTML + "\n" + settingsButton.outerHTML + "\n" + packagesButton.outerHTML;
    const rightHTML = timeDisplay.outerHTML;
    const html = leftHTML + rightHTML;

    const header = document.getElementById("mainHeader")
    header.style.backgroundColor = "hsl(75, 63, 13)"
    header.innerHTML = html

    local.headerButtons = {
        constellation: document.getElementById("nimbusHeaderButton-Constellation"),
        system: document.getElementById("nimbusHeaderButton-System"),
        files: document.getElementById("nimbusHeaderButton-Files"),
        terminal: document.getElementById("nimbusHeaderButton-Terminal"),
        library: document.getElementById("nimbusHeaderButton-Library"),
        settings: document.getElementById("nimbusHeaderButton-Settings"),
        packages: document.getElementById("nimbusHeaderButton-Packages"),
        time: document.getElementById("nimbusTimeDisplay")
    };

    const headerButtons = local.headerButtons

    const user = await call.whoami()

    headerButtons.terminal.addEventListener("click", async function () {
        const users = await call.read("/etc/passwd")
        const userinf = users[user]
        await call.exec(userinf.shell, [], false)
    });

    headerButtons.library.addEventListener("click", async function () {
        const users = await call.read("/etc/passwd")
        const userinf = users[user]
        await call.exec(userinf.shell, [userinf.homeDir], false)
    });

    if (!system.development) {
        window.addEventListener("contextmenu", e => e.preventDefault());
    }

    changeWallpaper("Icelandic Mountain - Luca Micheli.jpg")

    //document.addEventListener('keydown', async function (e) {
    //    if (csw.keydown("modifier")) {
    //        let caught = true
    //        switch (e.code) {
    //            case "Space":
    //                await system.startProcess(PID, "/usr/bin/boulder")
    //                console.debug('search')
    //                break;
    //            default:
    //                caught = false
    //        }
    //        if (caught) {
    //            e.preventDefault()
    //        }
    //    }
    //})
    local.times = 0

    local.changeWallpaper = changeWallpaper;
}

async function changeWallpaper(name) {
    // changes the wallpaper

    const videoTypes = [
        "mp4",
        "webm",
        "ogg"
    ];

    const dataURI = await call.read(`/usr/share/backgrounds/${name}`);

    let html = document.createElement("div");
    html.id = "nimbusWallpaperElem";
    html = html.outerHTML;
    const type = String(name).textAfterAll(".");
    const isVid = videoTypes.includes(type);

    if (isVid) {
        html = `<video autoplay muted playsinline loop id="nimbusWallpaperElem"></video>`;
    }

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: html
    });

    await new Promise(function (resolve) {
        setTimeout(resolve, 5)
    })

    const img = document.getElementById("nimbusWallpaperElem")
    img.id = "nimbusWallpaperElem";
    img.style.width = "100%";
    img.style.height = "100%";

    if (isVid) {
        img.src = dataURI;
        setTimeout(async function () {
            const vid = document.getElementById("nimbusWallpaperElem");
            vid.play();
        }, 100)
    } else {
        img.style.background = `url(${dataURI})`;
        img.style.backgroundPosition = "center";
        img.style.backgroundSize = "cover";
        img.style.backgroundRepeat = "no-repeat";
    }

    local.wallpaperCorrectForResize = setInterval(() => {
        if ((local.innerWidth !== window.innerWidth) || (local.innerHeight !== window.innerHeight)) {
            local.correctWallpaperPosition();
        };

        local.innerWidth = Number(window.innerWidth);
        local.innerHeight = Number(window.innerHeight);
    }, 100)

    local.wallpaperCorrect = setInterval(() => {
        local.correctWallpaperPosition();
    }, 2500)

    local.dateCorrect = setInterval(() => {
        const date = new Date(Date.now())
        local.headerButtons.time.innerText = String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "\t\t" + String(date.getDate()).padStart(2, "0") + "/" + String(date.getMonth()).padStart(2, "0") + "/" + String(date.getFullYear()).padStart(4, "0");
    }, 750)

    window.addEventListener("resize", local.correctWallpaperPosition)
}

async function frame() {
    const msgs = await call.readMsgs(true)

    for (const i in msgs) {
        const msg = msgs[i]
        const data = msg.content

        if (typeof data !== "object") {
            continue;
        }

        switch (data.intent) {
            case "wallpaperSet":
                changeWallpaper(data.wallpaper)
                break;
        }
    }
};

function terminate() {
    clearInterval(local.wallpaperCorrectForResize)
    clearInterval(local.wallpaperCorrect)
    clearInterval(local.dateCorrect)
    window.removeEventListener("resize", local.correctWallpaperPosition)
}