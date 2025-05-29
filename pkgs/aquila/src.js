// Aquila Shell

function compile() {
	// code gets provided 'code' and 'safe'
	let script = code.split("\n")
	const result = []
	result.push("function init() {")

	for (const i in script) {
		let line = script[i].split("#")[0]

		if (line == "") continue;

		line = `parent.run("${script[i]}")`

		result.push(line)
	}

	result.push("}")

	return result.join("\n")
}

function Stringify(data) {
	switch (typeof data) {
		case "object":
			return JSON.stringify(data, null, 4)
		default:
			return String(data)
	}
}

async function init([dr]) {

	let directory = dr

	if (directory == undefined) {
		let usr = await call.usrinf();
		directory = usr.homeDir;
	}

	local.history = []
	local.historyPos = 0
	local.user = await call.whoami()
	local.shared = {} // need to remove since shared is no longer accessible by child processes
	local.shared.dir = directory
	local.shared.PID = PID

	local.stdToLogs = function (std) {
		const stdout = Stringify(std).split("\n")

		const result = []

		for (const i in stdout) {
			let type
			let first = 0

			switch (stdout[i].substring(0, 5)) {
				case "[LOG]":
					type = "log"
					first = 5
					break;
				case "[WRN]":
					type = "warn"
					first = 5
					break;
				case "[ERR]":
					type = "error"
					first = 5
					break;
				default:
					type = "post"
			}

			result.push({
				type: type,
				text: stdout[i].substring(first, Infinity)
			})
		}
		return result
	}

	async function resolveLocation(name, path = []) {

		let cmd

		async function considerLocation(name, path) {
			const loc = await call.fullDirectory(name, path);

			const content = await call.read(loc)
			if (content !== undefined) {
				return {
					ok: true,
					dir: loc
				};
			} else {
				return {
					ok: false,
					dir: loc
				};
			};
		};

		let binName = String(name)

		if ([".", "/", "~"].includes(binName[0])) {
			cmd = await call.fullDirectory(binName, local.shared.dir);
		} else {
			binName = binName.toLowerCase();

			for (const i in path) {
				const pathItem = path[i];

				const base = await considerLocation(binName, pathItem);
				if (base.ok === true) {
					cmd = String(base.dir);
					break;
				};

				const js = await considerLocation(binName + ".js", pathItem);
				if (js.ok === true) {
					cmd = String(js.dir);
					break;
				};
			}
		}

		return cmd
	}

	local.run = async function (code, isUnsafe) {
		local.shared.user = String(local.user);

		if ([null, undefined, ""].includes(code)) {
			return;
		}

		// setup args
		let argsPre = String(code).split(" ");

		let binName = argsPre[0];

		argsPre = argsPre.slice(0); // remove the command from the array
		let args = []
		let redirect = undefined
		// loop through to find if there's a redirect
		for (const i in argsPre) {
			if (argsPre[i] == ">") {
				redirect = await call.fullDirectory(argsPre[String(Number(i) + 1)], local.shared.dir)
				break;
			} else {
				args.push(argsPre[i])
			}
		}

		local.history.push(code); // append to history

		const path = [
			"/System/apps/utils",
			await call.fullDirectory("§/apps/utils")
		];

		let cmd = await resolveLocation(binName, path)

		let result = {
			PID: NaN,
			stdout: ''
		};

		if (cmd == undefined || await call.read(cmd) == undefined) {
			local.logging.post(Name, `command not found: ${binName}`);
		} else {
			//local.runner = csw.permissions.elevate().maxPID + 1

			const stdin = undefined;

			try {
				result = await call.exec(cmd, args.slice(1), stdin, true);
			} catch(e) {
				result.stdout = e.stack;
			};

			delete local.runner;

			
			if (redirect == undefined) {
				const stdout = local.stdToLogs(result.stdout);

				let process = (result.process || {});

				const name = String(process.name)
				for (const i in stdout) {
					const type = stdout[i].type;
					const text = stdout[i].text;

					local.logging[type](name, text, local.logs, false, true);
				}
			} else {
				await call.write(redirect, result.stdout)
			}
		}
		local.updateLogs()
	}

	local.shared.run = local.run

	function destring(string) {
		let str = string
		str = str.trimLeft()
		str = str.trimRight()
		return str
	}

	local.formatRun = async function (code, pre, silent, isUnsafe) {
		// log to console
		if (!silent) local.logging.post("", pre + code)
		const split = code.split(";")

		if (code == "exit") {
			await call.kill(PID)
		}

		for (const i in split) {
			split[i] = destring(split[i])
			await local.run(split[i], isUnsafe)
		}
	}

	// actual gui system

	local.logs = []

	local.logsDiv = document.createElement("div");
	local.logsDiv.id = `aquilaLogs${PID}`;
	local.logsDiv.style.wordWrap = "break-word";

	local.input = document.createElement("input");
	local.input.id = `aquilaInput${PID}`;
	local.input.init = false;
	local.input.style.width = "90%";
	local.input.style.height = "auto";
	//local.input.style.color = "white";
	local.input.style.backgroundColor = "rgba(0, 0, 0, 0)";
	local.input.style.border = "0px";
	local.input.style.left = "0px";
	local.input.style.outline = "None";
	local.input.style.fontFamily = "Source Code Pro";
	local.input.style.fontOpticalSizing = "auto";
	local.input.style.fontWeight = "450";
	local.input.style.fontSize = "16px";

	local.pretext = document.createElement("pretext");
	local.pretext.id = `aquilaPretext${PID}`;

	local.style = document.createElement('style');
	local.style.textContent = ""

	const colours = [`AliceBlue`, `AntiqueWhite`, `Aqua`, `Aquamarine`, `Azure`, `Beige`, `Bisque`, `Black`, `BlanchedAlmond`, `Blue`, `BlueViolet`, `Brown`, `BurlyWood`, `CadetBlue`, `Chartreuse`, `Chocolate`, `Coral`, `CornflowerBlue`, `Cornsilk`, `Crimson`, `Cyan`, `DarkBlue`, `DarkCyan`, `DarkGoldenRod`, `DarkGray`, `DarkGrey`, `DarkGreen`, `DarkKhaki`, `DarkMagenta`, `DarkOliveGreen`, `Darkorange`, `DarkOrchid`, `DarkRed`, `DarkSalmon`, `DarkSeaGreen`, `DarkSlateBlue`, `DarkSlateGray`, `DarkSlateGrey`, `DarkTurquoise`, `DarkViolet`, `DeepPink`, `DeepSkyBlue`, `DimGray`, `DimGrey`, `DodgerBlue`, `FireBrick`, `FloralWhite`, `ForestGreen`, `Fuchsia`, `Gainsboro`, `GhostWhite`, `Gold`, `GoldenRod`, `Gray`, `Grey`, `Green`, `GreenYellow`, `HoneyDew`, `HotPink`, `IndianRed`, `Indigo`, `Ivory`, `Khaki`, `Lavender`, `LavenderBlush`, `LawnGreen`, `LemonChiffon`, `LightBlue`, `LightCoral`, `LightCyan`, `LightGoldenRodYellow`, `LightGray`, `LightGrey`, `LightGreen`, `LightPink`, `LightSalmon`, `LightSeaGreen`, `LightSkyBlue`, `LightSlateGray`, `LightSlateGrey`, `LightSteelBlue`, `LightYellow`, `Lime`, `LimeGreen`, `Linen`, `Magenta`, `Maroon`, `MediumAquaMarine`, `MediumBlue`, `MediumOrchid`, `MediumPurple`, `MediumSeaGreen`, `MediumSlateBlue`, `MediumSpringGreen`, `MediumTurquoise`, `MediumVioletRed`, `MidnightBlue`, `MintCream`, `MistyRose`, `Moccasin`, `NavajoWhite`, `Navy`, `OldLace`, `Olive`, `OliveDrab`, `Orange`, `OrangeRed`, `Orchid`, `PaleGoldenRod`, `PaleGreen`, `PaleTurquoise`, `PaleVioletRed`, `PapayaWhip`, `PeachPuff`, `Peru`, `Pink`, `Plum`, `PowderBlue`, `Purple`, `Red`, `RosyBrown`, `RoyalBlue`, `SaddleBrown`, `Salmon`, `SandyBrown`, `SeaGreen`, `SeaShell`, `Sienna`, `Silver`, `SkyBlue`, `SlateBlue`, `SlateGray`, `SlateGrey`, `Snow`, `SpringGreen`, `SteelBlue`, `Tan`, `Teal`, `Thistle`, `Tomato`, `Turquoise`, `Violet`, `Wheat`, `White`, `WhiteSmoke`, `Yellow`, `YellowGreen`,]

	for (const i in colours) {
		const colour = colours[i]
		local.style.textContent += `${colour} { color: ${colour} }`
		local.style.textContent += `${colour}Background { background-color: ${colour} }`
	}

	local.inputContainer = document.createElement('div');
	local.inputContainer.id = `aquilaInputContainer${PID}`;
	local.inputContainer.style.display = "flex";
	local.inputContainer.style.justifyContent = "space-around";

	local.container = document.createElement('div');
	local.container.id = `aquilaContainer${PID}`;
	local.container.style.display = "grid";
	local.container.style.marginBottom = "0px";
	local.container.style.lineHeight = "20px";
	local.container.style.whiteSpace = "pre";
	local.container.style.marginLeft = "10px";
	local.container.style.marginTop = "10px";

	local.inputContainer.innerHTML = local.style.outerHTML + "\n" + local.pretext.outerHTML + "\n" + local.input.outerHTML
	local.container.innerHTML = local.logsDiv.outerHTML + "\n" + local.inputContainer.outerHTML
	local.containerBackup = local.container

	local.sky = await call.pidOfName("skylightWindowSystem");

	if (isNaN(local.sky)) {
		await call.claimDevice("display")
		await call.deviceRope("display", "setInnerHTML", ["display", local.container.outerHTML])
	} else {
		call.send(local.sky, {
			intent: "newWindow"
		});
	}

	local.updateLogs = async function () {
		const visible = await call.visible()
		if (!visible) {
			return;
		}

		if (local.readingInput == true) {
			return;
		}


		// make sure elements are properly inplace
		local.logsDiv = document.getElementById(`aquilaLogs${PID}`);
		local.pretext = document.getElementById(`aquilaPretext${PID}`);
		local.input = document.getElementById(`aquilaInput${PID}`);
		local.container = document.getElementById(`aquilaContainer${PID}`);

		if (local.container == null) {
			call.send(local.sky, {
				intent: "setWindowContents",
				contents: local.containerBackup.outerHTML
			});
			call.send(local.sky, {
				intent: "renameWindow",
				text: "Aquila"
			});
			setTimeout(local.updateLogs, 25)
			return

		}

		// pretext
		const hostname = await call.gethostname()
		const pretextData = `${local.user}@${hostname} ${local.shared.dir} % `
		if (local.pretext.innerText !== pretextData) {
			local.pretext.innerText = pretextData
		}

		// input
		local.input.style.color = "rgba(255, 255, 255, 255)"
		if (!local.input.init) {
			local.input.init = true
			local.input.addEventListener('keydown', async function (event) {
				switch (event.key) {
					case "Enter":
						if (local.readingInput == true) {
							local.readingInputEnter = true
						} else {

							local.historyPos = 0
							const text = local.pretext.innerText

							const selection = String(local.input.value)
							local.input.value = ""

							local.lastSelection = selection
							local.lastText = text

							await local.formatRun(selection, text)

						}
						break;
					case "ArrowUp":
						await local.formatRun(local.lastSelection, local.lastText)
						break;
				}
			});
		}

		// logs
		let data = ""

		let logsTMP = JSON.parse(JSON.stringify(local.logs))

		//const proc = await call.read("/proc")
		//const proc = csw.permissions.elevate().processes
		//const mem = csw.permissions.elevate().memory.processes
		//
		//if (proc[local.runner] !== undefined) {
		//	const stdout = mem[local.runner].std.out
		//
		//	const stdlogs = local.stdToLogs(stdout)
		//
		//	for (const i in stdlogs) {
		//		const obj = stdlogs[i]
		//
		//		const pcsName = proc[local.runner].name
		//
		//		local.logging[obj.type](pcsName, obj.text, logsTMP, false, false)
		//	}
		//}
		const logs = logsTMP

		for (const i in logs) {
			let prefix = "p"
			switch (logs[i].type) {
				case "warn":
					prefix = "orange"
					break;
				case "error":
					prefix = "red"
					break;
			}
			let temp = `<${prefix} id='${logs[i].type}' style='margin-top: 0px; margin-bottom: 0px;'>`
			temp += logs[i].content
			temp += `</${prefix}>`
			data += temp
		}

		if (data !== local.oldLogs) {
			local.oldLogs = String(data)

			if (local.logsDiv.innerHTML !== data) {
				local.logsDiv.innerHTML = data
			}
		}
	}

	// logging functions

	const log = local.shared
	local.logging = {}

	local.logging.log = function (name, content, logArr = local.logs, updateLogs = true) {
		const obj = {
			type: "log",
			origin: name,
			content: `${name}: ${content}`
		}
		obj.content = `${name}: ${window.stringify(content, true)}`
		logArr.push(obj)
		if (updateLogs) {
			local.updateLogs()
		}
		return logArr.length - 1
	}

	local.logging.post = function (name, content, logArr = local.logs, updateLogs = true) {
		const obj = {
			type: "post",
			origin: name,
			content: content
		}
		obj.content = window.stringify(content, true)
		logArr.push(obj);
		if (updateLogs) {
			local.updateLogs();
		};
		return logArr.length - 1
	}

	local.logging.warn = function (name, content, logArr = local.logs, updateLogs = true,) {
		const obj = {
			type: "warn",
			origin: name,
			content: name + ": " + content
		}
		obj.content = `${name}: ${window.stringify(content, true)}`
		logArr.push(obj)
		if (updateLogs) {
			local.updateLogs()
		}
		return logArr.length - 1
	}

	local.logging.error = function (name, content, logArr = local.logs, updateLogs = true) {
		const obj = {
			type: "error",
			origin: name,
			content: name + ": " + content
		}
		obj.content = `${name}: ${window.stringify(content, true)}`
		logArr.push(obj)
		if (updateLogs) {
			local.updateLogs()
		}
		return logArr.length - 1
	}

	local.logging.editLog = function (origin, str, id, newType) {
		let obj = ""
		switch (local.logs[id].type) {
			case "post":
				obj = {
					type: (newType || "post"),
					content: window.stringify(str),
					origin: origin
				}
				break;
			default:
				obj = {
					type: (newType || local.logs[id].type),
					content: (origin || Name) + ": " + window.stringify(str),
					origin: origin
				}
		}
		if (origin == local.logs[id].origin) {
			local.logs[id] = obj
			local.updateLogs()
		} else {
			logs.warn("Program " + origin + " has attemped to overwrite a log of a different program, log ID: " + local.logs[id].origin)
		}
	}

	log.getInput = function (str, showAsTyping) {

		local.updateLogs()

		local.readingInput = true
		local.readingInputEnter = false

		// make the textbox invisible
		local.pretext.innerText = str

		return new Promise((resolve, reject) => {

			let interval = setInterval(() => { // start interval loop

				if (local.readingInputEnter) {

					clearInterval(interval)
					delete local.readingInput

					const val = String(local.input.value)
					local.input.value = ""

					// make input visible again
					local.input.style.color = undefined

					delete local.readingInput
					delete local.readingInputEnter

					// resolve the promise
					resolve(val)
				} else if (showAsTyping == false) {
					local.input.style.color = "rgba(0, 0, 0, 0)"
				}
			}, 50)
		})
	}

	log.changeUser = async function (username = "root", pass) {
		const user = username
		const userData = await call.usrinf(user)

		console.log(userData)
		console.log(userData == undefined)

		// make sure the user exists
		if (userData == undefined) {
			throw new Error(`aq - User ${user} does not exist.`)
		} else if (userData.password == undefined) {
			throw new Error(`User ${user} has no assigned password`)
		}

		// get the user password input
		let password = pass
		if (password == undefined) {
			password = await log.getInput("Password: ", false)
		}

		const newUser = await call.chusr(username, password)
		local.user = user
		local.shared.user = String(local.user)
		local.shared.dir = userData.homeDir

		if (newUser.ok == true) {
			return true
		} else {
			throw newUser
		}
	}

	log.getUser = () => {
		return local.user
	}

	log.clear = function () {
		local.logs = []
	}

	log.changeDir = async function (directory) {
		const dir = await call.fullDirectory(directory, log.dir)
		if (await call.isFolder(dir)) {
			local.shared.dir = dir
		} else {
			return `not a directory: ${dir}`
		}
	}

	local.interval = setInterval(async function () {
		let focused = await call.focused()
		try {
			if (focused == true) {
				local.updateLogs()
				local.input.focus()
			}
		} catch (e) { }
	}, 100)

	await new Promise(function (resolve) {
		setTimeout(resolve, 0)
	})

	local.updateLogs()

	local.times = 0
}

function frame() {
}

function terminate() {
	clearInterval(local.interval)
}