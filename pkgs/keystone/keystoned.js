#! /usr/bin/js

const indexDir = "/var/lib/keystone/index.json"
const indexFolder = async () => "/var/lib/keystone"

async function getConfig() {
    const keystoneConfig = await call.read(local.configDir);

    return keystoneConfig
}

async function setConfig(data) {
    await call.write(local.configDir, data)
}

async function insureConfig() {
    const cfg = await getConfig()

    if (typeof cfg !== "object") {
        const newCfg = {
            locations: [
                "/"
            ]
        }

        await setConfig(newCfg)
    }

    let associations = {}
    local.associations = associations

    const share = await call.readdir("/usr/share/keystone/extensions")
    for (const i in share) {
        const item = share[i]

        if (item.textAfterAll(".") == "json") {
            const fulldir = await call.fullDirectory(item, "/usr/share/keystone/extensions")
            const conf = await call.read(fulldir)

            if (typeof conf !== "object") {
                continue;
            }

            const funcdir = await call.fullDirectory(conf.name + ".js", "/usr/share/keystone/extensions")
            const funcsrc = await call.read(funcdir)
            const func = new Function("call", funcsrc)
            const splitterFunc = func(call)

            for (const i in conf.filetypes) {
                const type = conf.filetypes[i]
                associations[type] = splitterFunc
            }
        }
    }
}


async function index() {
    const conf = await call.read(local.configDir)

    let files = []

    for (const i in conf.locations) {
        const location = conf.locations[i]

        files = files.concat(
            await listSubfiles(location)
        )
    }

    const index = await buildIndex(files)

    await call.write(indexDir, index)
}


async function init() {

    local.configDir = (await call.read("/etc/passwd"))[await call.whoami()].homeDir + "/.config/keystone.json";

    await call.shout("keystoned")

    const varlib = await call.readdir("/var/lib")
    if (!varlib.includes("keystone")) {
        await call.mkdir("/var/lib/keystone")
    }

    await insureConfig()

    await index()
    local.refreshIndex = setInterval(index, 60000)
}

function frame() {

}





function tokenise(text, type = "txt") {
    if (typeof local.associations[type] !== "function") {
        return []
    }

    return local.associations[type] (type, text)
}

async function buildIndex(paths) {
    const index = {}

    for (const i in paths) {
        const path = paths[i]
        const content = await call.read(path)

        if (typeof content !== "string") {
            continue;
        }

        const name = path.split("/").pop()
        const filetype = path.split(".").pop()

        const filenameTokens = tokenise(name)
        const contentTokens = tokenise(content, filetype)

        if (contentTokens.length == 0) {
            continue;
        }

        const wordCounts = new Map()

        filenameTokens.forEach(word => {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 3)
        })

        contentTokens.forEach(word => {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
        })

        for (const [wrd, count] of wordCounts) {

            const word = "_" + wrd

            if (!index[word]) {
                index[word] = []
            }

            try {
            index[word].push({
                dir: path,
                weight: count
            })
        } catch(e) {
            console.warn(e)
            console.log(index)
            console.log(word)
        }
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 10)
        })
    }

    return index
}

async function listSubfiles(dir) {
    const ls = await call.readdir(dir);

    let list = [];

    for (const i in ls) {
        const loc = await call.fullDirectory(ls[i], dir);
        
        const isFolder = await call.isFolder(loc)

        if (isFolder) {
            // it's a folder (walk it)
            list = list.concat(
                await listSubfiles(loc)
            )
        } else {
            // it's a file (add it to the list)
            list.push(loc)
        }
    }

    return list
}
local.listSubfiles = listSubfiles


function search(query, index) {
  const queryWords = tokenise(query);
  const docScores = new Map();

  queryWords.forEach(word => {
    const entries = index["_" + word];
    if (!entries) return;

    entries.forEach(({ dir, weight }) => {
      docScores.set(dir, (docScores.get(dir) || 0) + weight);
    });
  });

  // Convert to array and sort by score (descending)
  const ranked = [...docScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([dir, score]) => ({
      dir,
      score
    }));

  return ranked;
}




function terminate() {
    clearInterval(local.refreshIndex)
}