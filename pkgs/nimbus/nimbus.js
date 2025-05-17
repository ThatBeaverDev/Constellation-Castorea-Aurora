#! /usr/bin/node

// nimbus desktop environment

async function getConfig() {
    const passwd = await call.read("/etc/passwd");
    const user = await call.whoami();
    const nimbusCfgDir = passwd[user].homeDir + "/.config/nimbus.json";
    const nimbuscfg = await call.read(nimbusCfgDir);

    return nimbuscfg
}

async function setConfig(data) {
    const passwd = await call.read("/etc/passwd");
    const user = await call.whoami();
    const nimbusCfgDir = passwd[user].homeDir + "/.config/nimbus.json";

    await call.write(nimbusCfgDir, data)
}

async function insureConfig() {
    const cfg = await getConfig()

    if (typeof cfg !== "object") {
        const newCfg = {}

        newCfg.wallpaper = "MountainUnderStars.jpg"

        await setConfig(newCfg)
    }
}

async function applyConfig() {

    const cfg = await getConfig()

    changeWallpaper(cfg.wallpaper)
}

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

    insureConfig()

    local.contextBox = document.getElementById("nimbusContextBox");

    local.sky = await call.pidOfName("skylightWindowSystem");

    if (isNaN(local.sky)) {
        await call.exec("/usr/bin/skyinit")

        await new Promise((resolve) => {
            let interval = setInterval(async () => {
                local.sky = await call.pidOfName("skylightWindowSystem");

                if (!isNaN(local.sky)) {
                    clearInterval(interval)
                    resolve()
                }
            })
        })
    }

    await call.send(local.sky, {
        intent: "newWindow"
    });

    async function correctWallpaperPosition() {
        await call.send(local.sky, {
            intent: "moveWindow",
            left: -25,
            top: -100,
            zIndex: "-100"
        });
        await call.send(local.sky, {
            intent: "resizeWindow",
            width: window.innerWidth + 50,
            height: window.innerHeight + 200
        });
    }

    local.innerWidth = Number(window.innerWidth)
    local.innerHeight = Number(window.innerHeight)
    local.correctWallpaperPosition = correctWallpaperPosition
    correctWallpaperPosition()

    let style = document.createElement("style")
    style.id = "nimbusStyles"
    document.body.appendChild(style)

    document.getElementById("display").style.overflow = ""

    style = document.getElementById("nimbusStyles")
    local.refreshStyles = async () => {
        style.textContent = await call.read("/usr/share/nimbus/styles.css")
    }
    local.refreshStyles();

    function makeDropdown(element, options, clickFunction) {

        let mouseover = false;
        let omouseover = false;
        let inner

        function item(text) {
            return `<p>${text}</p>`
        }

        function menu() {
            if (mouseover && !omouseover) {

                inner = String(element.innerHTML)

                const dropdown = document.createElement("div");
                dropdown.innerHTML = item(options[0])

                element.innerHTML += dropdown.outerHTML
            } else {
                element.innerHTML = inner
            }
            omouseover = mouseover
        }

        element.addEventListener("mouseenter", (event) => {
            mouseover = true;
            console.debug("mouseover")
            menu()
        });
        element.addEventListener("mouseleave", (event) => {
            mouseover = false;
            menu()
        });
    };

    // Load icon
    const ssmIcon = document.createElement("img");
    ssmIcon.src = await call.read("/usr/share/nimbus/icons/telescope.svg");
    ssmIcon.style.width = "100%";
    ssmIcon.style.filter = "invert(100%) brightness(10000%)";
    ssmIcon.style.height = "auto";
    ssmIcon.style.color = "white";
    ssmIcon.style.padding = "None";
    ssmIcon.id = "nimbusHeaderButton-Constellation-svg";

    // Create constellation button
    const constellationButton = document.createElement("button");
    constellationButton.id = "nimbusHeaderButton-Constellation";
    constellationButton.className = "nimbusHeaderInner nimbusHeaderInnerWithinDropdown";
    constellationButton.style.padding = "None";
    constellationButton.appendChild(ssmIcon);

    // Create dropdown wrapper
    const constellationWrapper = document.createElement("div");
    constellationWrapper.className = "nimbusHeaderDropdownWrapper";
    constellationWrapper.id = "nimbusHeaderDropdown-ConstellationWrapper";

    // Add the button to the wrapper
    constellationWrapper.appendChild(constellationButton);

    // Create the actual dropdown container
    const constellationDropdown = document.createElement("div");
    constellationDropdown.className = "nimbusHeaderDropdown";
    constellationDropdown.style.display = "none"; // Hidden by default

    class dropdownButton {
        constructor(technicalName, formattedName) {
            const elem = document.createElement("button");
            elem.innerText = formattedName || technicalName;
            elem.className = "nimbusHeaderInnerDropdownItem";
            elem.id = "nimbusHeaderInnerDropdownItem-" + technicalName

            this.elem = elem
        };
    }

    let options = {
        "about": "About Constellation",
        "forceQuit": "Force Quit Processes",
        "shutdown": "Shutdown",
        "reboot": "Reboot",
        "logout": "Log out of " + await call.whoami()
    }

    for (const i in options) {
        constellationDropdown.appendChild(new dropdownButton(i, options[i]).elem);
    }

    // Add dropdown to wrapper
    constellationWrapper.appendChild(constellationDropdown);

    // Other buttons
    const systemButton = document.createElement("button");
    systemButton.id = "nimbusHeaderButton-System";
    systemButton.innerText = "System";
    systemButton.className = "nimbusHeaderInner";

    const terminalButton = document.createElement("button");
    terminalButton.id = "nimbusHeaderButton-Terminal";
    terminalButton.innerText = "Terminal";
    terminalButton.className = "nimbusHeaderInner";

    const libraryButton = document.createElement("button");
    libraryButton.id = "nimbusHeaderButton-Library";
    libraryButton.innerText = "Library";
    libraryButton.className = "nimbusHeaderInner";

    const settingsButton = document.createElement("button");
    settingsButton.id = "nimbusHeaderButton-Settings";
    settingsButton.innerText = "Settings";
    settingsButton.className = "nimbusHeaderInner";

    const packagesButton = document.createElement("button");
    packagesButton.id = "nimbusHeaderButton-Packages";
    packagesButton.innerText = "Packages";
    packagesButton.className = "nimbusHeaderInner";

    // Right side
    const timeDisplay = document.createElement("button");
    timeDisplay.innerText = "07:46:04   04/03/2025";
    timeDisplay.className = "nimbusHeaderInnerRight";
    timeDisplay.id = "nimbusTimeDisplay";

    // Compose header HTML
    const leftHTML = constellationWrapper.outerHTML + "\n" +
        systemButton.outerHTML + "\n" +
        terminalButton.outerHTML + "\n" +
        libraryButton.outerHTML + "\n" +
        settingsButton.outerHTML + "\n" +
        packagesButton.outerHTML;

    const rightHTML = timeDisplay.outerHTML;
    const html = leftHTML + rightHTML;

    const header = document.getElementById("mainHeader");
    header.style.backgroundColor = "hsl(75, 63, 13)";
    header.innerHTML = html;


    local.headerButtons = {
        constellation: document.getElementById("nimbusHeaderButton-Constellation"),
        constellationDropdown: document.querySelector("#nimbusHeaderDropdown-ConstellationWrapper .nimbusHeaderDropdown"),
        system: document.getElementById("nimbusHeaderButton-System"),
        files: document.getElementById("nimbusHeaderButton-Files"),
        terminal: document.getElementById("nimbusHeaderButton-Terminal"),
        library: document.getElementById("nimbusHeaderButton-Library"),
        settings: document.getElementById("nimbusHeaderButton-Settings"),
        packages: document.getElementById("nimbusHeaderButton-Packages"),
        time: document.getElementById("nimbusTimeDisplay")
    };

    const headerButtons = local.headerButtons;

    let visible = false
    let inside = false
    headerButtons.constellation.addEventListener("mouseover", () => {
        const dropdown = headerButtons.constellationDropdown;
        dropdown.style.display = "block";
        visible = true
        inside = false
    });
    headerButtons.constellation.addEventListener("mouseout", () => inside = false)

    document.addEventListener("click", () => {
        if (visible && !inside) {
            const dropdown = headerButtons.constellationDropdown;
            dropdown.style.display = "none";
            visible = false
        }
    });

    document.getElementById("nimbusHeaderInnerDropdownItem-forceQuit").addEventListener("click", async (event) => {
        await call.exec("/usr/bin/forceQuit")
    });

    const user = await call.whoami();

    headerButtons.terminal.addEventListener("click", async function () {
        const users = await call.read("/etc/passwd");
        const userinf = users[user];
        await call.exec(userinf.shell, [], false);
    });

    headerButtons.library.addEventListener("click", async function () {
        const users = await call.read("/etc/passwd");
        const userinf = users[user];
        await call.exec(userinf.shell, [userinf.homeDir], false);
    });

    if (!system.development) {
        window.addEventListener("contextmenu", e => e.preventDefault());
    };

    await applyConfig();

    local.keyboardShortcuts = async function (event) {

        if (event.repeat) return;

        const ctrl = navigator.platform == "MacIntel" ? event.metaKey : event.ctrlKey
        switch (event.code) {
            case "Space":
                if (event.altKey) {
                    await call.exec("/usr/bin/keystonegui")
                    event.preventDefault()
                }
                break;
            case "KeyT":
                if (event.altKey && ctrl) {
                    await call.exec("/bin/aquila.js")
                }
                break;
            case "KeyW":
                if (event.altKey) {
                    await call.kill(system.mainFcs)
                }
                break;
            case "KeyQ":
                if (event.altKey) {
                    const name = system.processes[system.mainFcs].name
                    const processes = []
                    for (const i in system.processes) {
                        if (system.processes[i].name === name) {
                            processes.push(i)
                        }
                    }

                    for (const i in processes) {
                        await call.kill(processes[i])
                    }
                }
                break;
        }
    }

    document.addEventListener('keydown', local.keyboardShortcuts)
    local.times = 0;

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
    if (dataURI == undefined) {
        return;
    };

    const passwd = await call.read("/etc/passwd");
    const user = await call.whoami();
    const nimbusCfgDir = passwd[user].homeDir + "/.config/nimbus.json";
    const nimbuscfg = await call.read(nimbusCfgDir);

    nimbuscfg.wallpaper = name;

    await call.write(nimbusCfgDir, nimbuscfg);

    const ext = String(name).textAfterAll(".");

    let type = "image"
    if (videoTypes.includes(ext)) {
        type = "video";
    } else if (ext == "url") {
        type = "webpage";
    }

    let html
    switch (type) {
        case "video":
            html = `<video autoplay muted playsinline loop id="nimbusWallpaperElem"></video>`;
            break;
        case "webpage":
            html = document.createElement("iframe");
            html.style.width = "100%";
            html.style.height = "100%";
            html.id = "nimbusWallpaperElem";
            html = html.outerHTML
            break;
        default:
            html = document.createElement("div");
            html.id = "nimbusWallpaperElem";
            html = html.outerHTML;
    };

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

    switch (type) {
        case "video":
            img.src = dataURI;
            img.style.objectFit = "cover";
            setTimeout(async function () {
                const vid = document.getElementById("nimbusWallpaperElem");
                vid.play();
            }, 100)
            break;
        case "webpage":
            img.src = dataURI;
            break;
        default:
            img.style.background = `url(${dataURI})`;
            img.style.backgroundPosition = "center";
            img.style.backgroundSize = "cover";
            img.style.backgroundRepeat = "no-repeat";
    }
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
            case "wallpaperGet":
                const cfg = await getConfig()

                console.log("wallpaperGet")

                await call.send(msg.origin, cfg.wallpaper)

                console.log(cfg.wallpaper)
                break;
            case "refreshStyles":
                local.refreshStyles()
                break;
        }
    }
};

function terminate() {
    clearInterval(local.wallpaperCorrectForResize)
    clearInterval(local.wallpaperCorrect)
    clearInterval(local.dateCorrect)
    window.removeEventListener("resize", local.correctWallpaperPosition)
    window.removeEventListener("keydown", local.keyboardShortcuts)
}