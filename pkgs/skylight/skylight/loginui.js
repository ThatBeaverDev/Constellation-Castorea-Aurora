#!/System/js

async function login(username, password) {
    console.log(username)
    const userinf = await call.usrinf(username);

    if (userinf == undefined) {
        throw new Error(`User '${username}' does not exist!`);
    };

    const desktop = userinf.desktopenv;

    if (desktop == undefined) {
        throw new Error(`User '${username}' does not support graphical login.`);
    };

    await call.exec(desktop, [], undefined, false, {
        username: username,
        password: password
    });

    await call.send(local.sky, {
        intent: "closeWindow"
    })
    await call.kill(".")
}



async function loginUI() {
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
    username.type = "text"
    username.placeholder = "Account Name"

    const password = document.createElement("input");
    password.id = "loginuiPassword";
    password.style.width = "50%";
    password.style.height = "30px";
    password.style.borderRadius = "5px";
    password.style.marginTop = "10px";
    password.type = "password"
    password.placeholder = "Password";

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
    belowText.innerText = "";

    const div = document.createElement("div")
    div.id = "loginuiDiv";
    div.style.width = "100%";
    div.style.height = "100%"
    div.innerHTML = "<center>" + pfp.outerHTML + "<br>" + username.outerHTML + "<br>" + password.outerHTML + "<br><br>" + loginButton.outerHTML + belowText.outerHTML + "</center>";

    const html = div.outerHTML;

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: html
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

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
            local.elements.button.click();
        };
    });

    local.elements.button.addEventListener("click", async (event) => {
        const username = local.elements.username.value;
        const password = local.elements.password.value;

        const hashed = await system.userPasswordHash(password);

        const user = await call.usrinf(username);

        if (user == undefined) {
            local.elements.belowText.style.color = "red";
            local.elements.belowText.innerText = `User '${username}' does not exist!`;
            return;
        };

        if (user.password === hashed) {
            try {
                await login(username, password);
            } catch (e) {
                local.elements.belowText.style.color = "red";
                local.elements.belowText.innerText = String(e);
                return;
            }
        } else {
            local.elements.belowText.style.color = "red";
            local.elements.belowText.innerText = "Incorrect Password.";
        };
    });
}

async function newUserUI() {
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
    username.type = "text"
    username.placeholder = "Account Name"

    const password = document.createElement("input");
    password.id = "loginuiPassword";
    password.style.width = "50%";
    password.style.height = "30px";
    password.style.borderRadius = "5px";
    password.style.marginTop = "10px";
    password.type = "password"
    password.placeholder = "Password";

    const passwordVerify = password.cloneNode(true);
    passwordVerify.id = "loginuiPasswordVerify"
    passwordVerify.placeholder = "Verify Password";

    const belowText = document.createElement("p");
    belowText.id = "loginuiText";
    belowText.innerText = "";

    const createUser = document.createElement("button");
    createUser.id = "loginuiButton";
    createUser.innerText = "Create User";
    createUser.style.background = "rgb(191, 191, 191)";
    createUser.style.color = "black";
    createUser.style.borderRadius = "5px";
    createUser.style.width = "50%";
    createUser.style.height = "30px";

    const div = document.createElement("div")
    div.id = "loginuiDiv";
    div.style.width = "100%";
    div.style.height = "100%"
    div.innerHTML = "<center>" + pfp.outerHTML + "<br>" + username.outerHTML + "<br>" + password.outerHTML + "<br>" + passwordVerify.outerHTML + "<br>" + belowText.outerHTML + "<br><br>" + createUser.outerHTML + "</center>";

    const html = div.outerHTML;

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: html
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    local.elements = {
        pfp: document.getElementById("loginuiPfp"),
        username: document.getElementById("loginuiUsername"),
        password: document.getElementById("loginuiPassword"),
        passwordVerify: document.getElementById("loginuiPasswordVerify"),
        belowText: document.getElementById("loginuiText"),
        button: document.getElementById("loginuiButton")
    };

    local.elements.username.addEventListener("keyup", (event) => {
        if (event.key == "Enter") {
            local.elements.password.focus()
        }
    })

    local.elements.password.addEventListener("keyup", (event) => {
        if (event.key == "Enter") {
            local.elements.passwordVerify.click();
        };
    });

    local.elements.passwordVerify.addEventListener("keyup", (event) => {
        if (event.key == "Enter") {
            local.elements.button.click();
        };
    });

    let created = false;
    local.elements.button.addEventListener("click", async (event) => {
        const username = local.elements.username.value;
        const password = local.elements.password.value;
        const passwordVerify = local.elements.passwordVerify.value;

        if (password.length < 5) {
            local.elements.belowText.style.color = "Red";
            local.elements.belowText.innerText = "Password must be over 5 characters.";
            return;
        };

        if (password !== passwordVerify) {
            local.elements.belowText.style.color = "Red";
            local.elements.belowText.innerText = "Passwords must match.";
            return;
        };

        try {
            let mkusr = await call.exec("/System/apps/utils/useradd.js", [username, "-p", password]);
            console.debug(mkusr)
        } catch (e) {
            local.elements.belowText.style.color = "Red";
            local.elements.belowText.innerText = String(e);
            return;
        }

        created = {
            username: username,
            password: password
        };
    });

    await new Promise((resolve) => {
        let interval = setInterval(async () => {
            if (created !== false) {
                clearInterval(interval);
                resolve();
            };
        });
    });

    console.debug(created)
    await login(created.username, created.password)
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

    if (Object.keys(loginUsers).length == 0) {
        // no users that can log in - prompt for new user.
        await newUserUI();
    } else {
        await loginUI();
    };
};

function frame() {

};