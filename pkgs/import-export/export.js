// export files to host

function textToDataURI(data, type = "plain/text") {
    const str = String(data)
    const b64 = btoa(unescape(encodeURIComponent(str)))
    const uri = `data:${type};base64,` + b64
    return uri
}

async function init(args) {

    // credit to https://extensions.turbowarp.org/files.js for these 3 functions
    const downloadBlob = async (blob, file) => {
        const url = URL.createObjectURL(blob);
        try {
          await download(url, file);
        } catch (e) {
          throw new Error(e);
        }
        URL.revokeObjectURL(url);
      };
    const isDataURL = (url) => {
        try {
            const parsed = new URL(url);
            return parsed.protocol === "data:";
        } catch (e) {
            return false;
        }
    };
    const downloadUntrustedURL = async (url, file) => {
        if (isDataURL(url)) {
            // TODO: Scratch.fetch's better handling of data: means this is probably not needed anymore
            // and it the blob: probably works better with big files
            return download(url, file);
        }

        std.out += url
        const res = await csw.net.fetch(url);
        const blob = await res.blob();
        await downloadBlob(blob, file);
    };

    download = async (url, name) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };


    const dir = csw.fs.toDirectory(args[0], parent.dir)
    const data = await csw.fs.read(dir)

    const reversed = dir.split("").reverse().join("")
    const reversedName = reversed.substring(reversed.indexOf("/"), 0)
    const name = reversedName.split("").reverse().join("")

    let uri

    if (data.substring(0, 5) == "data:") {
        // binary file format
        uri = data
    } else {
        // text file (which will be converted to the same format as binary to export)
        uri = textToDataURI(data, "plain/text")
    }
    
    // download it
    downloadUntrustedURL(uri, name)
}