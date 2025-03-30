// Aquila Shell

function compile() {
	// code gets provided 'code' and 'safe'
	let script = code.split("\n")
	const result = []
	result.push("function init() {")

	for (const i in script) {
		let line = script[i].split("#")[0]

		if (line == "") continue;

		line = `parent.run("${ script[i] }")`

		result.push(line)

		console.log(line)
	}

	result.push("}")

	return result.join("\n")
}


function init() {
	local.history = []
	local.historyPos = 0
	local.user = system.user
	local.shared.dir = "/"

	local.run = async function(code, isUnsafe) {
		const system = csw.permissions.elevate()

		let segments = String(code).split(" ")
		segments[0] = segments[0].toLowerCase()
		const path = system.path
		local.history.push(code)
		let cmd
		for (const i in path) {
			let temp = path[i] + "/" + segments[0]
			if (system.fs.readFile(temp) !== undefined) {
				cmd = String(temp)
				break;
			} else {
				temp = path[i] + "/" + segments[0] + ".js"
				if (system.fs.readFile(temp) !== undefined) {
					cmd = String(temp)
					break;
				}
			}
		}
		if (system.fs.readFile(cmd) == undefined) {
			local.shared.post(Name, `command not found: ${ segments[0] }`)
		} else {
			await system.startProcess(PID, cmd, segments.slice(1), isUnsafe)
		}
	}

	local.shared.run = local.run
	
	function destring(string) {
		let str = string
		str = str.trimLeft()
		str = str.trimRight()
		return str
	}

	local.splitAndRun = async function(code, pre, silent, isUnsafe) {
		// log to console
		if (!silent) local.shared.post("", pre + code)
		const split = code.split(";")

		for (const i in split) {
			split[i] = destring(split[i])
			await local.run(split[i], isUnsafe)
		}
	}

	// actual gui system

	local.logs = []

	local.logsDiv = document.createElement("div")
	local.logsDiv.id = `aquilaLogs${PID}`

	local.input = document.createElement("input")
	local.input.id = `aquilaInput${PID}`
	local.input.init = false
	local.input.style.width = "90%"
	local.input.style.height = "auto"
	local.input.style.color = "white"
	local.input.style.backgroundColor = "rgba(0, 0, 0, 0)"
	local.input.style.border = "0px"
	local.input.style.left = "0px"
	local.input.style.outline = "None"
	local.input.style.fontFamily = "Source Code Pro"
	local.input.style.fontOpticalSizing = "auto"
	local.input.style.fontWeight = "450"
	local.input.style.fontSize = "16px"

	local.pretext = document.createElement("pretext")
	local.pretext.id = `aquilaPretext${PID}`

	local.inputContainer = document.createElement('div')
	local.inputContainer.id = `aquilaInputContainer${PID}`
	local.inputContainer.style.marginTop = "0px"
	local.inputContainer.style.display = "flex"
	local.inputContainer.style.justiftContent = "space-around"

	local.container = document.createElement('div')
	local.container.id = `aquilaContainer${PID}`
	local.container.style.display = "grid"
	local.container.style.marginBottom = "0px"
	local.container.style.lineHeight = "20px"
	local.container.style.whiteSpace = "pre"
	local.container.style.marginTop = "75px"
	local.container.style.marginLeft = "25px"

	local.style = document.createElement('style');
	local.style.textContent = ""

	const colours = [`AliceBlue`,`AntiqueWhite`,`Aqua`,`Aquamarine`,`Azure`,`Beige`,`Bisque`,`Black`,`BlanchedAlmond`,`Blue`,`BlueViolet`,`Brown`,`BurlyWood`,`CadetBlue`,`Chartreuse`,`Chocolate`,`Coral`,`CornflowerBlue`,`Cornsilk`,`Crimson`,`Cyan`,`DarkBlue`,`DarkCyan`,`DarkGoldenRod`,`DarkGray`,`DarkGrey`,`DarkGreen`,`DarkKhaki`,`DarkMagenta`,`DarkOliveGreen`,`Darkorange`,`DarkOrchid`,`DarkRed`,`DarkSalmon`,`DarkSeaGreen`,`DarkSlateBlue`,`DarkSlateGray`,`DarkSlateGrey`,`DarkTurquoise`,`DarkViolet`,`DeepPink`,`DeepSkyBlue`,`DimGray`,`DimGrey`,`DodgerBlue`,`FireBrick`,`FloralWhite`,`ForestGreen`,`Fuchsia`,`Gainsboro`,`GhostWhite`,`Gold`,`GoldenRod`,`Gray`,`Grey`,`Green`,`GreenYellow`,`HoneyDew`,`HotPink`,`IndianRed`,`Indigo`,`Ivory`,`Khaki`,`Lavender`,`LavenderBlush`,`LawnGreen`,`LemonChiffon`,`LightBlue`,`LightCoral`,`LightCyan`,`LightGoldenRodYellow`,`LightGray`,`LightGrey`,`LightGreen`,`LightPink`,`LightSalmon`,`LightSeaGreen`,`LightSkyBlue`,`LightSlateGray`,`LightSlateGrey`,`LightSteelBlue`,`LightYellow`,`Lime`,`LimeGreen`,`Linen`,`Magenta`,`Maroon`,`MediumAquaMarine`,`MediumBlue`,`MediumOrchid`,`MediumPurple`,`MediumSeaGreen`,`MediumSlateBlue`,`MediumSpringGreen`,`MediumTurquoise`,`MediumVioletRed`,`MidnightBlue`,`MintCream`,`MistyRose`,`Moccasin`,`NavajoWhite`,`Navy`,`OldLace`,`Olive`,`OliveDrab`,`Orange`,`OrangeRed`,`Orchid`,`PaleGoldenRod`,`PaleGreen`,`PaleTurquoise`,`PaleVioletRed`,`PapayaWhip`,`PeachPuff`,`Peru`,`Pink`,`Plum`,`PowderBlue`,`Purple`,`Red`,`RosyBrown`,`RoyalBlue`,`SaddleBrown`,`Salmon`,`SandyBrown`,`SeaGreen`,`SeaShell`,`Sienna`,`Silver`,`SkyBlue`,`SlateBlue`,`SlateGray`,`SlateGrey`,`Snow`,`SpringGreen`,`SteelBlue`,`Tan`,`Teal`,`Thistle`,`Tomato`,`Turquoise`,`Violet`,`Wheat`,`White`,`WhiteSmoke`,`Yellow`,`YellowGreen`,]


	for (const i in colours) {
		const colour = colours[i]
		local.style.textContent += `${ colour } { color: ${ colour } }`
		local.style.textContent += `${ colour }Background { background-color: ${ colour } }`
	}

	local.inputContainer.innerHTML = local.style.outerHTML + "\n" + local.pretext.outerHTML + "\n" + local.input.outerHTML
	local.container.innerHTML = local.logsDiv.outerHTML + "\n" + local.inputContainer.outerHTML
	local.containerBackup = local.container


	csw.terminal.fullscreen(PID)
	csw.terminal.set(PID, local.container.outerHTML)


	local.updateLogs = function() {
		if (system.fcs !== PID) {
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
				csw.terminal.set(PID, local.containerBackup.outerHTML)
			}
		}
		
		// pretext
		local.pretext.innerText = `${ local.user }@${ system.hostname } ${local.shared.dir} % `
		
		// input
		local.input.style.color = "rgba(255, 255, 255, 255)"
		if (!local.input.init) {
			local.input.init = true
			local.input.addEventListener('keydown', async function (event) {
				switch(event.key) {
					case "Enter":
						if (local.readingInput == true) {
							local.readingInputEnter = true
							console["log"]("Input taken.")
						} else {

							local.historyPos = 0
							const text = local.pretext.innerText
							
							console["log"]("Command Submitted to run")
							const selection = String(local.input.value)
							local.input.value = ""
							if (csw) {
								await local.splitAndRun(selection, text)
							} else {
								await local.splitAndRun(selection, text)
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

		for (const i in local.logs) {
			let temp = "<p id='" + local.logs[i].type + "' style='margin-top: 0px; margin-bottom: 0px;'>"
			temp += local.logs[i].content
			temp += "</p>"
			data += temp
		}

		local.logsDiv.innerHTML = data
	}

	// logging functions

	const log = local.shared

	log.log = function(name, content) {
		const obj = {
			type: "log",
			origin: name,
			content: `${name}: ${content}`
		}
		console.log(obj.content)
		obj.content = `${name}: ${system.cast.Stringify(content, true)}`
		local.logs.push(obj)
		local.updateLogs()
		return local.logs.length - 1
	}

	log.post = function(name, content) {
		const obj = {
			type: "post",
			origin: name,
			content: content
		}
		console.log(obj.content)
		obj.content = system.cast.Stringify(content, true)
		local.logs.push(obj)
		local.updateLogs()
		return local.logs.length - 1
	}

	log.warn = function(name, content) {
		local.logs.push({
			type: "warn",
			origin: name,
			content: name + ": " + content
		})
		local.updateLogs()
		return local.logs.length - 1
	}

	log.error = function(name, content) {
		local.logs.push({
			type: "error",
			origin: name,
			content: name + ": " + content
		})
		local.updateLogs()
		return local.logs.length - 1
	}

	log.editLog = function(origin, str, id, newType) {
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

	log.getInput = function(str, showAsTyping) {
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

					if (showAsTyping !== false) {
						local.shared.post(Name, str + val)
					} else {
						local.shared.post(Name, str)
					}

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

	log.changeUser = async function(username, password) {
		const user = username
		const userData = system.users[user]

		// make sure the user exists
		if (userData == undefined) {
			throw new Error(`User ${ user } does not exist.`)
		} else if (userData.password == undefined) {
			throw new Error(`User ${ user } has no assigned password`)
		}

		// get the user password input
		if (password == undefined) {
			password = await log.getInput("Password: ", false)
		}

		// hash it
		const passHash = system.cryptography.sha_256(password)
		// mid

		if (passHash == userData.password) {
			local.user = user
		}

		if (typeof login == "object") {
			return login
		}

		if (local.user == username) {
			local.shared.dir = system.users[username].homeDir
			return true
		} else {
			return false
		}

	}

	log.clear = function() {
		local.logs = []
		local.updateLogs()
	}

	log.changeDir = function(dir) {
		local.shared.dir = csw.fs.toDirectory(dir, log.dir)
	}

	local.updateLogs()

	local.interval = setInterval(function() {
		local.updateLogs()

		try {
			local.input.focus()
		} catch (e) {}
	}, 100)

	local.updateLogs()
}

function frame() {}

function terminate() {
	clearInterval(local.interval)
}