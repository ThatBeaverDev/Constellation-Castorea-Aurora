#! /System/apps/compilers/js

const indexDir = "/System/apps/data/keystone/index.json"

async function getConfig() {
    const keystoneConfig = await call.read(local.configDir);

    return keystoneConfig
}

async function init([command, ...args]) {

    local.configDir = (await call.usrinf()).homeDir + "/Config/keystone.json";

    switch (command) {
        case "search":
            const index = await call.read(indexDir)

            const result = search(
                String(args[0]),
                index
            )

            let text = ""
            for (const i in result) {
                text += result[i].dir + "\n"
            }

            std.out = text
            break;
    }   
}

function getPrefixMatches(word, index) {
    const words = [
        word
    ]

    for (const indexWord in index) {
        if (indexWord.startsWith("_" + word)) {
            words.push(indexWord)
        }
    }

    return words
}


function search(query, index) {
  const wordsRaw = tokenise(query);
  let words = []

  for (const i in wordsRaw) {
    words = words.concat(
        getPrefixMatches(wordsRaw[i], index)
    )
  }

  const docScores = new Map();

  // loop through the query's words
  words.forEach(word => {
    const entries = index["_" + word];
    if (!entries) return; // if the word isn't in the database, ignore it

    // loop through files with that word in them, adding their weight to the scores
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

function tokenise(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // remove punctuation so it doesn't mean 'and' and 'and.' get counted seperately
        .split(/\s+/)
        .filter(Boolean);
}