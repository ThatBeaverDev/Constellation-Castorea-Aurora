#! /System/apps/compilers/js

async function reloadFonts() {
    let style = "#display {\n\tfont-family: 'Source Code Pro';\n}\n";

    const fonts = await call.readdir("§/fonts")
    for (const i in fonts) {
        const name = String(fonts[i]).textBefore(".");

        const url = await call.read("§/fonts/" + fonts[i]);

        const thisFont = `@font-face {\n\tfont-family: '${name}';\n\tsrc: url(${url});\n}\n`;

        style += thisFont;
    } 

    local.fontStyles.textContent = style
}

async function init(args) {
    call.shout("skylightFontSystem")

    const fontStyles = document.createElement("style");
    fontStyles.id = "skylightFonts";

    document.body.appendChild(fontStyles)

    local.fontStyles = document.getElementById("skylightFonts");

    reloadFonts()

    local.times = 0
}

function frame() {
    local.times++

    if (local.times % 5000 == 0) {
        reloadFonts()
    }
}