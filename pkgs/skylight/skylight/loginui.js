#!/System/js

async function login(username, password) {
    const userinf = (await call.read("/System/users.json"))[username]

    const desktop = userinf.desktopenv

    await call.exec(desktop, [], undefined, false, {
        username: username,
        password: password
    });

    throw "Login Complete - Forcefully Exiting."
    return
}

async function init() {
    const users = await call.read("/System/users.json");

    const loginUsers = {};
    local.users = loginUsers

    for (const username in users) {
        const user = users[username];

        if (user.desktopenv !== undefined) {
            loginUsers[username] = {
                passwordHash: user.password
            };
        };
    };

    console.debug(loginUsers)
    local.sky = await call.pidOfName("skylightWindowSystem")

    await call.send(local.sky, {
        intent: "newWindow"
    })

    await call.send(local.sky, {
        intent: "renameWindow",
        text: "Login"
    })

    const width = 500;
    const height = 350;

    await call.send(local.sky, {
        intent: "moveWindow",
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
        zIndex: "100"
    });
    await call.send(local.sky, {
        intent: "resizeWindow",
        width: width,
        height: height
    });

    try {
        await call.exec("/System/apps/gui/skylightLoginUIWallpaper");
    } catch (e) {
        console.warn(e)
    }


    const pfpURI = await call.read("/System/wallpapers/catalinaDay.jpg") // needs updated

    const pfp = document.createElement("img")
    pfp.style.borderRadius = "15%"
    pfp.style.width = "100px"
    pfp.style.height = "100px"
    pfp.id = "loginuiPfp"
    pfp.src = pfpURI

    const username = document.createElement("input");
    username.id = "loginuiUsername";
    username.style.width = "50%";
    username.style.height = "30px";
    username.style.borderRadius = "5px";

    const password = document.createElement("input");
    password.id = "loginuiPassword";
    password.style.width = "50%";
    password.style.height = "30px";
    password.style.borderRadius = "5px";
    password.style.marginTop = "10px";
    password.type = "password"

    const loginButton = document.createElement("button");
    loginButton.id = "loginuiButton";
    loginButton.innerText = "Login";
    loginButton.style.background = "rgb(191, 191, 191)";
    loginButton.style.color = "black";
    loginButton.style.borderRadius = "5px";
    loginButton.style.width = "50%";
    loginButton.style.height = "30px";

    const belowText = document.createElement("p");
    belowText.id = "loginuiText";
    belowText.innerText = "Login"

    const div = document.createElement("div")
    div.id = "loginuiDiv";
    div.style.width = "100%";
    div.style.height = "100%"
    div.innerHTML = "<center>" + pfp.outerHTML + "<br>" + username.outerHTML + "<br>" + password.outerHTML + "<br><br>" + loginButton.outerHTML + belowText.outerHTML + "</center>";

    const html = div.outerHTML

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: html
    });

    await new Promise((resolve) => setTimeout(resolve, 50))

    local.elements = {
        pfp: document.getElementById("loginuiPfp"),
        username: document.getElementById("loginuiUsername"),
        password: document.getElementById("loginuiPassword"),
        button: document.getElementById("loginuiButton"),
        belowText: document.getElementById("loginuiText")
    };

    local.elements.username.addEventListener("keyup", (event) => {
        if (event.key == "Enter") {
            local.elements.password.focus()
        }
    })

    local.elements.password.addEventListener("keyup", (event) => {
        if (event.key == "Enter") {
            local.elements.button.click()
        }
    })

    local.elements.button.addEventListener("click", async (event) => {
        const username = local.elements.username.value
        const password = local.elements.password.value

        const hashed = await system.userPasswordHash(password)

        const users = await call.read("/System/users.json")
        const user = users[username]

        if (user.password === hashed) {
            local.elements.belowText.style.color = "black"
            local.elements.belowText.innerText = "Correct Password."

            login(username, password)

        } else {
            local.elements.belowText.style.color = "red"
            local.elements.belowText.innerText = "Incorrect Password."
        }
    })
};

function frame() {

};