#!/System/apps/compilers/js

async function init() {

    local.sky = await call.pidOfName("skylightWindowSystem");

    await call.send(local.sky, {
        intent: "newWindow"
    });

    const wallpaperFile = await call.read("§/wallpapers/sonomaOrange.jpg");

    const wallpaper = document.createElement("img")
    wallpaper.id = "skylightLoginUIWallpaperImg";
    wallpaper.style.width = "100%";
    wallpaper.style.height = "100%";
    wallpaper.src = wallpaperFile;

    const html = wallpaper.outerHTML;

    await call.send(local.sky, {
        intent: "setWindowContents",
        contents: html
    });

    await call.send(local.sky, {
        intent: "moveWindow",
        top: -50,
        left: -20,
        zIndex: -100
    })

    await call.send(local.sky, {
        intent: "resizeWindow",
        width: window.innerWidth + 40,
        height: window.innerHeight + 40
    })
};

function frame() {
    
};