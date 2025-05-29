#! /System/apps/compilers/js

// credit where credit is due, https://github.com/kddnewton/tree/blob/main/tree.js
async function init(args) {
	async function walk(directory, prefix, maxDepth, depth) {
		if (depth > maxDepth) {
			return
		}

		const contents = await call.readdir(directory)

		contents.sort()

		for (const i in contents) {
			let file = contents[i]

			if ((file[i] !== ".") || (obj.showHidden)) {
				const parts = i == contents.length - 1 ? ["└── ", "    "] : ["├── ", "│   "];

				let dispFile = String(file);

				const asDir = await call.fullDirectory(file, directory);

				if (obj.fullDir) {
					dispFile = asDir;
				};

				if (await call.isDir(asDir)) {
					std.out += prefix + parts[0] + dispFile + `\n`;
					counts.dirs++
					await walk(asDir, prefix + parts[1], maxDepth, depth + 1);
				} else {
					if (!obj.dirOnly) {
						std.out += prefix + parts[0] + dispFile + `\n`;
					};
					counts.files++
				};
			};
		};
	};

	let dir = parent.dir;
	let obj = {};

	for (const i in args) {
		switch(args[i]) {
			case "-L":
				i++
				obj.maxLevels = args[i];
				break;
			case "-f":
				obj.fullDir = true;
				break;
			case "-d":
				obj.dirOnly = true;
				break;
			case "-a":
				obj.showHidden = true;
				break;
			default:
				// if the token is the first one, it's the directory
				if (args[i][0] !== "-") {
					dir = await call.fullDirectory(args[i], parent.dir)
				} else {
					std.out += "[WRN]Unknown Flag: " + args[i] + "\n";
				};
		};
	};

	let counts = {
		dirs: 0,
		files: 0
	};

	directory = String(dir);
	std.out = directory + "\n";

	await walk(directory, "", obj.maxLevels, 1)

	std.out += `Tree generated for ${counts.dirs} directories, ${counts.files} files`;
}