#! /usr/bin/node

// credit where credit is due, https://github.com/kddnewton/tree/blob/main/tree.js

async function init(args) {
	async function walk(directory, prefix, maxDepth, depth) {

		const contents = await csw.fs.listDir(directory)

		contents.sort()

		for (const i in contents) {
			const file = contents[i]
			if (file[0] != "." || obj.showHidden) {
				const parts = i == contents.length - 1 ? ["└── ", "    "] : ["├── ", "│   "];

				let dispFile = String(file)
				let asDir = csw.fs.toDirectory(file, directory)
				
				if (obj.fullDir) {
					dispFile = asDir
				}

				if (csw.fs.isDirectory(asDir)) {
					std.out += `${prefix}${parts[0]}${dispFile}\n`;
					counts.dirs += 1;
					await walk(asDir, `${prefix}${parts[1]}`, maxDepth, depth + 1);
				} else {
					if (!obj.dirOnly) {
						std.out += `${prefix}${parts[0]}${dispFile}\n`;
					}
					counts.files += 1;
				}

			}
		}
	}

	let dir = parent.dir
	const obj = {}

	// loop through parameters
	for (let i = 0; i < args.length; i++) {
		// check if the parameter is recognised
		switch (args[i]) {
			case "-L":
				i++
				obj.maxLevels = args[i]
				break;

			case "-f":
				obj.fullDir = true
				break;

			case "-d":
				obj.dirOnly = true
				break;

			case "-a":
				obj.showHidden = true
				break;

			default:
				// if the token is the first one, it's the directory
				if (args[i][0] !== "-") {
					dir = csw.fs.toDirectory(args[i], parent.dir)
				} else {
					std.out += "[WRN]Unknown flag: " + args[i]
				}
		}
	}

	const counts = {
		dirs: 0,
		files: 0
	};

	const directory = String(dir)
	std.out += String(directory) + "\n"

	await walk(directory, "", obj.maxLevels, 0);
	std.out += `Tree generated for ${counts.dirs} directories, ${counts.files} files`;
}