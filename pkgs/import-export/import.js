// import files

function init([dir = ""]) {

    const directory = csw.fs.toDirectory(dir)

    let input = document.createElement("input");
    input.type = "file";
    local.finished = false
    input.setAttribute("multiple", true);
    input.onchange = async function (event) {
        console.log(this.files)
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i]

            const reader = new FileReader()

            reader.addEventListener(
                "load",
                () => {
                    // convert image file to base64 string
                    const fileDir = directory + "/" + file.name
                    console.debug(token)
                    csw.fs.write(fileDir, reader.result)
                    console.log("File " + file.name + " imported to " + fileDir)
                },
                false,
            );

            if (file) {
                reader.readAsDataURL(file);
            }
        }
        setTimeout(function () {
            local.finished = true;
        }, 1000)
    };
    input.click();
}

function frame() {
    if (local.finished == true) {
        csw.processes.terminate(PID)
    }
}