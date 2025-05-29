#! /System/apps/compilers/js

// Aurora Package Manager for Constellation

async function downloadAndConvert(URL) {
	try {
		const response = await fetch(URL);
		console.log("fetchURL:get[URI] requesst sent to " + URL)
		if (!response.ok) {
			throw new Error('Failed to download the file.');
		}
		const blob = await response.blob();
		const dataURL = await this.blobToDataURL(blob);
		return dataURL;
	} catch (error) {
		std.out = '[ERR]Error:' + error
		return null;
	}
}

async function fetchLocation(URL) {
	try {
		const networkd = local.networkd

		if (isNaN(networkd)) {
			return await call.deviceRope("eth0", "get", [URL]);
		};

		await call.send(networkd, {
			intent: "networkRequest",
			type: "GET",
			target: URL
		});

		return new Promise(function (resolve) {
			let interval = setInterval(async function () {
				const msgs = await call.readMsgs(true);

				for (const i in msgs) {
					if (msgs[i].origin == networkd) {
						const msg = msgs[i];

						if (msg.origin == networkd) {
							clearInterval(interval)
							resolve(msg.content)
						}
					};
				};
			}, 10);
		});
	} catch (e) {
		return undefined
	}
};

async function setup() {

	local.fetch = fetchLocation;

	if (local.logs == undefined) {
		local.logs = [];
	};

	try {
		await call.readdir("§/apps/data/aurora");
	} catch (e) {
		const directories = [
			"§/config/aurora",
			"§/apps/data/aurora",
			"§/apps/data/aurora/lists"
		];

		for (const i in directories) {
			await call.mkdir(directories[i]);
		};

		await call.write("§/config/aurora/sources.json", {});
		await call.write("§/apps/data/aurora/files.json", {});
		await call.write("§/apps/data/aurora/sourceInf.json", {});
		await call.write("§/apps/data/aurora/installed.json", []);
	};

	local.networkd = await call.pidOfName("networkd");
	if (isNaN(local.networkd)) {
		// we need to claim the internet adapter to send requests

		local.ownsNet = true;

		await call.claimDevice("eth0");
	};

	local.aurora = await call.read("§/apps/data/aurora/state.json");


	if (local.aurora == undefined) {
		local.aurora = {};
		local.aurora.directory = "§/apps/data/aurora";

		// set state
		local.aurora.index = {};
		local.aurora.sources = [];
	};
	local.aurora.version = "v0.2.2";

	const queue = [];

	queue.push(call.write("§/apps/data/aurora/state.json", local.aurora));

	local.fileStorage = await call.read("§/apps/data/aurora/files.json");


	if (local.fileStorage == undefined) {
		queue.push(call.write("§/apps/data/aurora/files.json", {}));
	};

	for (const i in queue) {
		await queue[i]
	}

	local.fileStorage = await call.read("§/apps/data/aurora/files.json");

	local.index = local.aurora.index;
	local.sources = local.aurora.sources;
};

async function init(arguements, startup = true, manualInstall = true, isForUpgrade = false) {

	if (startup == true) {
		await setup();
	};

	const index = local.index

	const args = []
	const flags = []

	// check for flag parameters, and make sure they are in a seperate array
	for (const i in arguements) {

		if (arguements[i] == undefined) {
			console.warn("arg " + i + " is undefined?")
		}

		if (arguements[i][0] == "-") {
			flags.push(arguements[i])
		} else {
			args.push(arguements[i])
		}
	}

	let data
	let file
	local.id1 = undefined
	local.id2 = undefined
	let keys

	function handleStdOut() {
		std.out = local.logs.join("\n")
	}

	handleStdOut()

	function editLogs(first, second, patchType) {
		try {
			if (local.isSilent) {
				return
			}


			if (local.id1 == undefined) {
				local.logs.push(first)
				local.id1 = local.logs.length
			}

			if (local.id2 == undefined) {
				local.logs.push(second)
				local.id2 = local.logs.length
			}

			local.logs[local.id1] = first
			local.logs[local.id2] = second

			handleStdOut()
		} catch (e) {
			console.warn(e)
		}
	}

	local.isSilent = flags.includes("-s")

	const sources = await call.read("§/config/aurora/sources.json")

	const packageName = args[1]

	switch (args[0]) {
		case "sources":
			switch (args[1]) {
				case "add":
					try {
						let repos = await local.fetch(args[2] + "/repositories.json")

						if (repos == undefined) {
							std.out = "[ERR]the repository did not respond and has not been sourced."
							return
						}

						repos = JSON.parse(repos)

						if (args[3] == undefined) {
							args[3] = encodeURIComponent(args[2])
						}

						for (const i in repos) {
							const repo = repos[i]

							const identifier = (args[3] + "/" + repo || encodeURIComponent(new URL(repo, args[2]).href))
							sources[identifier] = args[2] + "/" + repo
						}

						await call.write("§/config/aurora/sources.json", sources)
					} catch (e) {
						std.out = String(e)
					}

					break;
				case "list":
					break;
				default:
					std.out = `[ERR]Unknown option of sources: "${args[1]}"`
			}
			break;
		case "index":
			const sourceInf = {}

			const sourceItems = await call.readdir("§/apps/data/aurora/lists")
			for (const i in sourceItems) {
				const item = sourceItems[i]
				await call.unlink("§/apps/data/aurora/lists/" + item)
			}

			for (const i in sources) {
				try {
					const source = sources[i];
					console.debug("Indexing", source, "(" + i + ")")
					const sourceURI = encodeURIComponent(i)

					const manifestTxt = await local.fetch(source + "/repository.json");

					if (manifestTxt == undefined) {
						std.out += "[WRN]Repository at " + source + " has not responded, its index has been deleted."
						continue;
					}

					const manifest = JSON.parse(manifestTxt)

					const packages = manifest.packages;
					await call.write("§/apps/data/aurora/lists/" + sourceURI + ".json", packages)

					const info = structuredClone(manifest);
					delete info.packages;

					console.debug(source, "(" + i + ")", "indexed")
					sourceInf[source] = info;
				} catch (e) {
					console.warn(e)
				};
			};

			await call.write("§/apps/data/aurora/sourceInf.json", sourceInf);
			break;
		case "full-upgrade":
			await init(["index"], false, false);
			await init(["upgrade", "aurora"], false, false);
			await init(["upgrade"], false, false);
			break;
		case "force-upgrade-all":
			await init(["index"]);

			const packages = await call.read("§/apps/data/aurora/installed.json");

			for (const i in packages) {
				await init(["upgrade", packages[i].name]);
			};

		case "upgrade":
			if (packageName == undefined) {
				// update everything.
				const installed = await call.read("§/apps/data/aurora/installed.json");

				for (const i in installed) {
					const item = installed[i];
					const localVersion = item.version


					const itemSource = await call.read("§/apps/data/aurora/lists/" + item.source + ".json");
					const remoteVersion = itemSource[item.name];

					if (remoteVersion !== localVersion) {
						console.warn(item.name + " needs to be updated")
						await init(["upgrade", item.name], false, false, true);
					}
				};
				break;
			};

			// specific package to update!

			await init(["uninstall", packageName], false, false, true);
			await init(["install", packageName], false, false, true);

			break;
		case "install":
			if (typeof packageName == "object") {
				for (const i in packageName) {
					await init(["install", packageName[i]], false);
				};
				return;
			};

			let repo;
			let repoName;
			let version;
			for (const i in sources) {
				const source = sources[i];
				const sourceURI = encodeURIComponent(i);

				const sourcePackages = await call.read("§/apps/data/aurora/lists/" + sourceURI + ".json");

				if (sourcePackages == undefined) {
					continue;
				}

				if (sourcePackages[packageName] !== undefined) {
					console.log("Package " + packageName + " found in repository " + source);
					repo = source;
					repoName = sourceURI;
					version = sourcePackages[packageName];
					break;
				};
			}

			if (repo == undefined) {
				editLogs("installation of " + packageName + " has failed because the package does not exist.", "", "error")
				console.warn("Package " + packageName + " cannot be installed because it was not found in any repositories - are you sure your indexes are up to date?")
				return
			}

			if (manualInstall == true) {
				const installed = await call.read("§/apps/data/aurora/installed.json");
				installed.push({
					name: packageName,
					source: repoName,
					version: version
				});
				await call.write("§/apps/data/aurora/installed.json", installed);
			}

			const url = repo + "/"

			local.fileStorage[packageName] = []

			editLogs(`install of ${packageName} 0% completed`, `--------------------`)

			// download the package info
			data = await local.fetch(url + packageName + "/info.json")

			editLogs(`install of ${packageName} 50% completed`, `##########----------`)

			// parse it, and if it's invalid, catch and tell the user the package either doesn't exist OR is formatted wrong
			try {
				data = JSON.parse(data)
			} catch (e) {
				editLogs("installation of " + packageName + " has failed because the package info is invalid: " + e, "", "error")
				break;
			}

			// create directories
			for (const i in data.directories) {

				let dir = data.directories[i]

				if (dir.startsWith("/System/")) {
					dir = "§/" + dir.substring(8, Infinity);
				};

				await call.mkdir(dir)
			}

			// install dependencies
			for (const i in data.dependencies) {
				await init(["install", data.dependencies[i]], false, false)
			}

			const queue = [];

			const writtenFiles = []

			// download other files the package needs
			const files = Object.keys(data.files || {});
			for (const i in files) {
				const file = files[i];
				let uri = url + args[1] + file;

				const type = file.substring(0, 5);
				const afterType = file.substring(5, Infinity);

				let dir = data.files[file];

				if (dir.startsWith("/System/")) {
					dir = "§/" + dir.substring(8, Infinity);
				};

				console.debug(dir)

				switch (type) {
					case "PARSE":
						uri = url + args[1] + afterType;
						break;
					case "DATAU":
						uri = url + args[1] + afterType;
						const response = await fetch(uri);
						console.log("fetchURL:getURI request sent to " + uri)
						const blob = await response.blob();
						const dataURL = await new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result);
							reader.onerror = reject;
							reader.readAsDataURL(blob);
						});

						queue.push(call.write(dir, dataURL));
						writtenFiles.push(dir)
						continue;
						break;
					case "https":
					case "HTTPS":
					case "http:":
					case "HTTP:":
						uri = file
						break;
				};

				// download
				let content = await local.fetch(uri);
				if (file.substring(0, 5) == "PARSE") {
					content = JSON.parse(content);
				};

				writtenFiles.push(dir);

				queue.push(call.write(dir, content));
			};

			index[args[1]] = data;


			if (data.lang == undefined) {
				data.lang = "";
			} else {
				data.lang = "." + data.lang;
			};

			if (data.directory !== undefined) {
				// download the file
				file = await local.fetch(url + packageName + "/src" + data.lang);

				if (data.directory !== undefined) {
					// write the file to it's specific directory
					// I intend to require elevated permissions for this in future
					let dir = data.directory + "/" + data.name + data.lang;

					if (dir.startsWith("/System/")) {
						dir = "§/" + dir.substring(8, Infinity);
					};

					local.fileStorage[args[1]].push(dir);

					writtenFiles.push(dir);
					queue.push(call.write(dir, file));
				} else {
					// write the file
					let dir = local.aurora.directory + "/" + data.name + data.lang;

					if (dir.startsWith("/System/")) {
						dir = "§/" + dir.substring(8, Infinity);
					};

					local.fileStorage[args[1]].push(dir);

					writtenFiles.push(dir);
					queue.push(call.write(dir, file));
				}
			}

			for (const i in queue) {
				await queue[i];
			};


			const installationFiles = await call.read("§/apps/data/aurora/files.json");

			if (typeof installationFiles[args[1]] == "undefined") {
				installationFiles[args[1]] = [];
			};

			for (const i in writtenFiles) {
				installationFiles[args[1]].push(writtenFiles[i]);
			};
			await call.write("§/apps/data/aurora/files.json", installationFiles);

			editLogs("installation of " + args[1] + " 100% completed", `####################`)

			break;
		case "uninstall":
			const toDelete = local.fileStorage[args[1]]
			console.debug(local.fileStorage)
			console.debug(toDelete)

			for (const i in toDelete) {
				const item = toDelete[i]

				await call.unlink(item)
			}

			delete index[args[1]]
			break;
		case "info":
			keys = Object.keys(aurora)
			for (const i in keys) {
				local.logs.push("   " + keys[i] + ": " + aurora[keys[i]])
			}
			break;
		case "list":
			keys = Object.keys(index)
			keys.sort()
			for (const i in keys) {
				local.logs.push("  -  " + keys[i])
			}
			break;
		case undefined:
		case "":
			local.logs.push("Example Usage:")
			local.logs.push("   - aurora install [package-name]")
			local.logs.push("   - aurora uninstall [package-name]")
			local.logs.push("   - aurora list")
			local.logs.push("   - aurora info")
			local.logs.push("   - aurora index:  updates package listings")
			local.logs.push("")
			local.logs.push("   - aurora -s:     runs aurora silently")
			break;
		default:
			std.out = "[ERR]Error: Unknown command: aurora " + args[0]
	}

	if (startup == true) {
		const queue = [
			call.write(local.aurora.directory + "/state.json", local.aurora),
			call.write(local.aurora.directory + "/files.json", local.fileStorage)
		];

		for (const i in queue) {
			await queue[i];
		};

		handleStdOut();

		if (local.ownsNet == true) {
			await call.releaseDevice("eth0")
		}
	};
};
