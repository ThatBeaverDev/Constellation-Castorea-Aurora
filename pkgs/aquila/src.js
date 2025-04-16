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

		console.log(line)
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

function init() {
	local.history = []
	local.historyPos = 0
	local.user = system.user
	local.shared.dir = "/"

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

	local.run = async function (code, isUnsafe, absorbLogs) {

		if ([null, undefined, ""].includes(code)) {
			return
		}

		// setup args
		let args = String(code).split(" ")
		const binName = args[0].toLowerCase()

		args = args.slice(0) // remove the command from the array

		const path = system.path

		local.history.push(code) // append to history

		let cmd // going to store the path to the file we are running

		if ([".", "/"].includes(binName[0])) {
			cmd = system.toDir(binName, local.shared.dir)
		} else {
			for (const i in path) {
				let temp = path[i] + "/" + binName
				if (system.fs.readFile(temp) !== undefined) {
					cmd = String(temp)
					break;
				} else {
					temp = path[i] + "/" + binName + ".js"
					if (system.fs.readFile(temp) !== undefined) {
						cmd = String(temp)
						break;
					}
				}
			}
		}

		let result = {
			PID: NaN,
			stdout: ''
		}

		if (system.fs.readFile(cmd) == undefined) {
			local.logging.post(Name, `command not found: ${binName}`)
		} else {
			local.runner = system.maxPID

			result = await system.startProcess(PID, cmd, args.slice(1), isUnsafe)

			delete local.runner

			const stdout = local.stdToLogs(result.stdout)

			for (const i in stdout) {

				let process = result.process

				const type = stdout[i].type
				const text = stdout[i].text
				
				local.logging[type](process.name, text)
			}
		}
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
			system.stopProcess(PID)
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

	local.input = document.createElement("input");
	local.input.id = `aquilaInput${PID}`;
	local.input.init = false;
	local.input.style.width = "90%";
	local.input.style.height = "auto";
	local.input.style.color = "white";
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

	local.style = document.createElement('style');
	local.style.textContent = ""

	const colours = [`AliceBlue`, `AntiqueWhite`, `Aqua`, `Aquamarine`, `Azure`, `Beige`, `Bisque`, `Black`, `BlanchedAlmond`, `Blue`, `BlueViolet`, `Brown`, `BurlyWood`, `CadetBlue`, `Chartreuse`, `Chocolate`, `Coral`, `CornflowerBlue`, `Cornsilk`, `Crimson`, `Cyan`, `DarkBlue`, `DarkCyan`, `DarkGoldenRod`, `DarkGray`, `DarkGrey`, `DarkGreen`, `DarkKhaki`, `DarkMagenta`, `DarkOliveGreen`, `Darkorange`, `DarkOrchid`, `DarkRed`, `DarkSalmon`, `DarkSeaGreen`, `DarkSlateBlue`, `DarkSlateGray`, `DarkSlateGrey`, `DarkTurquoise`, `DarkViolet`, `DeepPink`, `DeepSkyBlue`, `DimGray`, `DimGrey`, `DodgerBlue`, `FireBrick`, `FloralWhite`, `ForestGreen`, `Fuchsia`, `Gainsboro`, `GhostWhite`, `Gold`, `GoldenRod`, `Gray`, `Grey`, `Green`, `GreenYellow`, `HoneyDew`, `HotPink`, `IndianRed`, `Indigo`, `Ivory`, `Khaki`, `Lavender`, `LavenderBlush`, `LawnGreen`, `LemonChiffon`, `LightBlue`, `LightCoral`, `LightCyan`, `LightGoldenRodYellow`, `LightGray`, `LightGrey`, `LightGreen`, `LightPink`, `LightSalmon`, `LightSeaGreen`, `LightSkyBlue`, `LightSlateGray`, `LightSlateGrey`, `LightSteelBlue`, `LightYellow`, `Lime`, `LimeGreen`, `Linen`, `Magenta`, `Maroon`, `MediumAquaMarine`, `MediumBlue`, `MediumOrchid`, `MediumPurple`, `MediumSeaGreen`, `MediumSlateBlue`, `MediumSpringGreen`, `MediumTurquoise`, `MediumVioletRed`, `MidnightBlue`, `MintCream`, `MistyRose`, `Moccasin`, `NavajoWhite`, `Navy`, `OldLace`, `Olive`, `OliveDrab`, `Orange`, `OrangeRed`, `Orchid`, `PaleGoldenRod`, `PaleGreen`, `PaleTurquoise`, `PaleVioletRed`, `PapayaWhip`, `PeachPuff`, `Peru`, `Pink`, `Plum`, `PowderBlue`, `Purple`, `Red`, `RosyBrown`, `RoyalBlue`, `SaddleBrown`, `Salmon`, `SandyBrown`, `SeaGreen`, `SeaShell`, `Sienna`, `Silver`, `SkyBlue`, `SlateBlue`, `SlateGray`, `SlateGrey`, `Snow`, `SpringGreen`, `SteelBlue`, `Tan`, `Teal`, `Thistle`, `Tomato`, `Turquoise`, `Violet`, `Wheat`, `White`, `WhiteSmoke`, `Yellow`, `YellowGreen`,]


	for (const i in colours) {
		const colour = colours[i]
		local.style.textContent += `${colour} { color: ${colour} }`
		local.style.textContent += `${colour}Background { background-color: ${colour} }`
	}

	local.inputContainer.innerHTML = local.style.outerHTML + "\n" + local.pretext.outerHTML + "\n" + local.input.outerHTML
	local.container.innerHTML = local.logsDiv.outerHTML + "\n" + local.inputContainer.outerHTML
	local.containerBackup = local.container


	csw.display.fullscreen(PID)
	csw.display.set(PID, local.container.outerHTML)
	csw.display.rename(PID, "Aquila")

	local.updateLogs = function () {
		if (!csw.display.visible(PID)) {
			return
		}

		if (local.readingInput) {
			return
		}


		// make sure elements are properly inplace
		local.logsDiv = document.getElementById(`aquilaLogs${PID}`)
		local.pretext = document.getElementById(`aquilaPretext${PID}`)
		local.input = document.getElementById(`aquilaInput${PID}`)
		local.container = document.getElementById(`aquilaContainer${PID}`)


		if (system.fcs == PID) {
			if (local.container == null) {
				csw.display.set(PID, local.containerBackup.outerHTML)
				csw.display.rename(PID, "Aquila")
				return
			}
		}

		// pretext
		local.pretext.innerText = `${local.user}@${csw.fs.read("/etc/hostname")} ${local.shared.dir} % `

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
							if (csw) {
								await local.formatRun(selection, text)
							} else {
								await local.formatRun(selection, text)
							}

						}
						break;
					case "ArrowUp":
						break; // remove when trying to fix!
						if (local.readingInput == true) return

						if (local.history.length !== 0) {
							if (local.historyPos !== local.history.length) {
								local.historyPos--
								local.input.value = local.history[local.historyPos]
							}
						}
						break;
					case "ArrowDown":
						break; // remove when trying to fix!
						if (local.readingInput == true) return

						if (local.history.length !== 0) {
							if (local.historyPos !== 0) {
								local.historyPos++
								local.input.value = local.history[local.historyPos]
							}
						}
						break;
				}
			});
		}

		// logs
		let data = ""

		let logsTMP = JSON.parse(JSON.stringify(local.logs))

		if (local.runner !== undefined) {
			const stdout = system.processes[local.runner].std.out

			const stdlogs = local.stdToLogs(stdout)

			for (const i in stdlogs) {
				const obj = stdlogs[i]

				const pcsName = system.processes[local.runner].name

				local.logging[obj.type] (pcsName, obj.text, logsTMP, false)
			}
		}
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

		local.logsDiv.innerHTML = data
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
		obj.content = `${name}: ${system.cast.Stringify(content, true)}`
		logArr.push(obj)
		if (updateLogs) {
			system.log(name, obj.content)
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
		obj.content = system.cast.Stringify(content, true)
		logArr.push(obj)
		if (updateLogs) {
			system.log(name, obj.content)
			local.updateLogs()
		}
		return logArr.length - 1
	}

	local.logging.warn = function (name, content, logArr = local.logs, updateLogs = true) {
		const obj = {
			type: "warn",
			origin: name,
			content: name + ": " + content
		}
		obj.content = `${name}: ${system.cast.Stringify(content, true)}`
		logArr.push(obj)
		if (updateLogs) {
			system.warn(name, obj.content)
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
		obj.content = `${name}: ${system.cast.Stringify(content, true)}`
		logArr.push(obj)
		if (updateLogs) {
			sysetm.error(name, obj.content)
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
					content: system.cast.Stringify(str),
					origin: origin
				}
				break;
			default:
				obj = {
					type: (newType || local.logs[id].type),
					content: (origin || Name) + ": " + system.cast.Stringify(str),
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

	log.changeUser = async function (username, password) {
		const user = username
		const userData = csw.fs.read("/etc/passwd")[user]

		// make sure the user exists
		if (userData == undefined) {
			throw new Error(`User ${user} does not exist.`)
		} else if (userData.password == undefined) {
			throw new Error(`User ${user} has no assigned password`)
		}

		// get the user password input
		if (password == undefined) {
			password = await log.getInput("Password: ", false)
		}

		// hash it
		const passHash = window.cryptography.sha_256(password)
		// mid

		if (passHash == userData.password) {
			local.user = user
		}

		if (local.user == username) {
			local.shared.dir = userData.homeDir
			const newUser = csw.permissions.changeUser(PID, username, password)

			console.log(newUser)

			if (newUser.ok == true) {
				return true
			} else {
				throw newUser
			}
		} else {
			return false
		}
	}

	log.getUser = () => {
		return local.user
	}

	log.clear = function () {
		local.logs = []
		local.updateLogs()
	}

	log.changeDir = function (directory) {
		const dir = csw.fs.toDirectory(directory, log.dir)
		if (sse.fs.isFolder(dir)) {
			local.shared.dir = dir
		} else {
			return `not a directory: ${directory}`
		}
	}

	local.interval = setInterval(function () {
		local.updateLogs()

		try {
			local.input.focus()
		} catch (e) { }
	}, 100)
}

function frame() { }

function terminate() {
	clearInterval(local.interval)
}