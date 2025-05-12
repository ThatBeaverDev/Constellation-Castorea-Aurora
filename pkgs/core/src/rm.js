// delete files or directories

async function init(args) {

	async function walk(directory, verbose) {
		const list = await call.readdir(directory)

		let dir = String(directory)

		if (dir.at(-1) !== "/") {
			dir += "/"
		}

		for (const i in list) {
			const path = dir + list[i]

			const isDir = await call.isFolder(path)

			if (isDir) {
				await walk(path, verbose)
			} else {
				std.out += "Deleting file " + path
				await call.unlink(path)
			}
		}

		const delDir = await call.unlink(directory)
	}

	let dir
	const obj = {}

	// loop through parameters
	for (let i = 0; i < args.length; i++) {
		// check if the parameter is recognised
		switch (args[i]) {
			case "-d":
				obj.recursive = true
				break;

			case "-f":
				obj.prompt = false
				break;

			case "-i":
				obj.alwaysPrompt = true
				obj.prompt = true
				break;

			case "-I":
				obj.prompt = true
				obj.dirPrompt = true
				break;

			case "-r":
			case "-R":
				obj.recursive = true
				break;

			case "-v":
				obj.verbose = true
				break;

			case "-rf":
				obj.recursive = true
				obj.prompt = false
				break;

			default:
				// if the token is the last one, it's the dir
				if (i == args.length - 1) {
					dir = await call.fullDirectory(args[i], parent.dir)
				} else {
					std.out += "[WRN]Unknown flag: " + args[i];
				}
				i++
		}
	}


	const isDir = await call.isFolder(dir)

	let result = false

	if (isDir) {
		result = await walk(dir, obj.verbose)
	} else {
		result = await call.unlink(dir)
	}

	std.out = result
}