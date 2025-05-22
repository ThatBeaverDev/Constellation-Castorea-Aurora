#! /System/apps/compilers/js

// nimbus desktop environment

const configDir = async () => {
        const userinf = await call.usrinf()
        const nimbusCfgDir = await call.fullDirectory("Config/nimbus.json", userinf.homeDir);

        return nimbusCfgDir;
}

async function getConfig() {
    const dir = await configDir();
    local.config = await call.read(dir);
    return local.config
}

async function setConfig(data) {
    const dir = await configDir();
    console.log(dir)
    local.config = data
    await call.write(dir, structuredClone(data));
}

async function insureConfig() {
    local.config = await getConfig();
    let cfg = local.config;

    if (typeof cfg !== "object") {
        cfg = {};
        console.debug("Config not present - new config created.");
    };
    
    if (cfg.wallpaper == undefined) {
        console.debug("wallpaper not set - setting default.");
        cfg.wallpaper = "MountainUnderStars.jpg";
    };
    
    if (typeof cfg.icons !== "object") {
        console.debug("icons not created - creating.");
        cfg.icons = {};
    };
    
    if (cfg.icons.system == undefined) {
        console.debug("systemIcon not set - setting default.");
        cfg.icons.system = "satellite.svg";
    };
    
    if (cfg.icons.close == undefined) {
        console.debug("closeIcon not set - setting default.");
        cfg.icons.close = "close.svg";
    };
    
    if (cfg.icons.box == undefined) {
        console.debug("boxIcon not set - setting default.");
        cfg.icons.box = "box.svg";
    };

    console.debug(cfg);

    await setConfig(cfg);
};

async function applyConfig() {

    const cfg = await getConfig();

    changeWallpaper(cfg.wallpaper);
};

async function init() {

    if (!isNaN(await call.pidOfName("nimbusDE"))) {
        console.error("nimbusDE is already running - if you meant to access nimbus configuration, run nimbusctl.");
        std.out = "[ERR]nimbusDE is already running - if you meant to access nimbus configuration, run nimbusctl.";
        await call.kill(".");
        return;
    };

    await call.shout("nimbusDE");

    console.debug("Config Dir:", await configDir());
    
    await insureConfig();

    local.libmsg = await call.getLibrary("libmsg")

    local.contextBox = document.getElementById("nimbusContextBox");

    local.sky = await call.pidOfName("skylightWindowSystem");

    if (isNaN(local.sky)) {
        // well that's not good.

        std.out = "[WRN]well that's not good.\n\n\n[WRN](skylight should be running but isn't)";

        await call.kill('.');
    };

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
    await correctWallpaperPosition()

    let style = document.createElement("style")
    style.id = "nimbusStyles"
    document.body.appendChild(style)

    document.getElementById("display").style.overflow = ""

    style = document.getElementById("nimbusStyles")
    local.refreshStyles = async () => {
        style.textContent = await call.read("/System/apps/data/nimbus/styles.css")
    }
    await local.refreshStyles();

    // Load icon
    const ssmIcon = document.createElement("img");
    ssmIcon.src = await call.read(`/System/icons/${local.config.icons.system}`);
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
    local.headerStorage = String(header.innerHTML);
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
        await call.exec("/System/apps/gui/forceQuit")
    });
    document.getElementById("nimbusHeaderInnerDropdownItem-logout").addEventListener("click", async (event) => {
        await call.kill(".")
    });

    const user = await call.whoami();

    headerButtons.terminal.addEventListener("click", async function () {
        const userinf = await call.usrinf()
        await call.exec(userinf.shell, [], false);
    });

    headerButtons.library.addEventListener("click", async function () {
        const userinf = await call.usrinf()
        await call.exec(userinf.shell, [userinf.homeDir], false);
    });

    await applyConfig();

    async function getMainFcs() {
        const response =  await local.libmsg.request(local.sky, {
            intent: "getMainFcs"
        })

        const mainFcs = response.content.data

        return mainFcs
    }

    local.keyboardShortcuts = async function (event) {

        if (event.repeat) return;

        const ctrl = navigator.platform == "MacIntel" ? event.metaKey : event.ctrlKey
        switch (event.code) {
            case "Space":
                if (event.altKey) {
                    event.preventDefault()
                    await call.exec("/System/apps/gui/keystone")
                }
                break;
            case "KeyT":
                if (event.altKey && ctrl) {
                    event.preventDefault()
                    await call.exec("/System/apps/utils/aquila.js")
                }
                break;
            case "KeyW":
                if (event.altKey) {
                    event.preventDefault()
                    await call.kill(await getMainFcs())
                }
                break;
            //case "KeyQ":
            //    if (event.altKey) {
            //        const name = system.processes[await getMainFcs()].name
            //        const processes = []
            //        for (const i in system.processes) {
            //            if (system.processes[i].name === name) {
            //                processes.push(i)
            //            }
            //        }
            //
            //        for (const i in processes) {
            //            await call.kill(processes[i])
            //        }
            //    }
            //    break;
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

    const dataURI = await call.read(`/System/wallpapers/${name}`);
    if (dataURI == undefined) {
        return;
    };

    const nimbuscfg = await getConfig()

    nimbuscfg.wallpaper = name;

    await setConfig(nimbuscfg)

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
    document.getElementById("header").innerHTML = local.headerStorage
}