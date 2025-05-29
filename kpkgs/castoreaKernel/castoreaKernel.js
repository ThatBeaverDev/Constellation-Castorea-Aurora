async function start_kernel() {

	const Name = "/System/kernel/castoreaKernel.js"
	const PID = 0
	const args = []

	system.name = "Constellation - v0.5.0 (Dabli)"

	// patchovers for modules until they are included
	system.fetchURL = async (url) => {
		return (await fetch(url)).text()
	}
	system.baseURI = "."

	system.auroraURI = "https://aurora-pkgs.vercel.app";
    if (new URL(window.location.href).searchParams.get("auroraLocal") === "true") {
        system.auroraURI = "http://localhost:5079"
    }

	system.writeFileQueue = []
	system.volumeGUID = initram.volumeGUID

	const processes = system.processes

	const include = async function (name) {
		const dir = "/System/kernel/modules/" + name + ".js";

		let content
		try {
			content = await system.fs.readFile(dir);
		} catch (e) {
			if (!e instanceof TypeError) {
				throw e
			}
		}

		if (content == undefined) {
			try {
				system.log(Name, `Downloading Kernel module ${name}`)
			} catch {}

			content = await system.fetchURL(system.auroraURI + "/kpkgs/k" + name + "/" + name + ".js");

			if (content == undefined) {
				throw new Error("Content of module " + name + " is blank.");
			};

			let dir = "/System/kernel/modules/" + name + ".js"
			try {
				await system.fs.writeFile(dir, content);
			} catch (e) {
				if (e instanceof TypeError) {
					system.writeFileQueue.push({
						directory: dir,
						content: content
					})
				} else {
					throw e
				}
			}
			try {
				system.log(Name, `Kernel module ${name} now present (downloaded)`)
			} catch {};
		} else {
			try {
				system.log(Name, `Kernel module ${name} present`)
			} catch {};
		};

		content = `const moduleName = "/System/kernel/modules/${name}.js";\n\n${content}`

		const fnc = new system.asyncFunction("system", "Name", "PID", "args", "initram", content);

		const out = await fnc(system, Name, PID, args, initram);

		return out;
	};

	system.asyncFunction = Object.getPrototypeOf(async function () { }).constructor;

	let obj = {
		isCompatible: true
	}
	if ((crypto || {}).subtle == undefined) {
		obj.isCompatible = false
		obj.reason = "Crypto/subtle"
		obj.showReason = "crypto.subtle"
	}

	if (!obj.isCompatible) {
		system.error(Name, "Sorry, but your browser is not compatible with This System.")
		if (obj.showReason == undefined) obj.Showreason = obj.reason
		system.error(Name, 'Reason is your browser does not support <a href="https://developer.mozilla.org/en-US/docs/Web/API/' + obj.reason + '">' + obj.showReason + '</a>')
		document.getElementById("preInput").innerText = ""
		return
	}

	await include("stringUtils");
	await include("logging");
	await include("misc");
	await include("controlVariables");
	// input not included because i think it's not needed
	await include("cryptography");

	system.logs = []

	system.versions = {}

	// https://patorjk.com/software/taag/#p=display&h=0&f=Doom&t=Constellation 
	system.asciiName = " _____                     _          _  _         _    _               \n/  __ \\                   | |        | || |       | |  (_)              \n| /  \\/  ___   _ __   ___ | |_   ___ | || |  __ _ | |_  _   ___   _ __  \n| |     / _ \\ | '_ \\ / __|| __| / _ \\| || | / _` || __|| | / _ \\ | '_ \\ \n| \\__/\\| (_) || | | |\\__ \\| |_ |  __/| || || (_| || |_ | || (_) || | | |\n \\____/ \\___/ |_| |_||___/ \\__| \\___||_||_| \\__,_| \\__||_| \\___/ |_| |_|\n"
	system.post("", system.asciiName)
	system.post("", " ")
	//document.getElementById('preInput').innerText = "Please wait..."

	system.log(Name, "Starting JS Engine...")

	system.languages = {}
	system.langBackend = {} // need to remove but CRL needs it
	system.languages.js = async function (dir, safe) {
		// code provided by node

		// code gets provided 'dir' and 'safe'
		let script = await system.fs.readFile(dir)

		return script
	}

	system.focus = [];
	system.fcs = undefined;
	system.mainFcs = undefined;

	function getParentOfDir(dir) {
		if (dir == "/") {
			return "/"
		}

		const reversed = dir.split("").reverse().join("")
		const reversedParent = reversed.substring(reversed.indexOf("/") + 1)
		const parent = reversedParent.split("").reverse().join("")

		if (parent == "") {
			return "/"
		}

		return parent
	}

	system.toDir = (target, base = "/") => {
		if (target.startsWith('/')) return target;

		const baseParts = base.split('/').filter(Boolean);
		const targetParts = target.split('/');

		for (const part of targetParts) {
			if (part === '.' || part === '') continue;
			if (part === '..') {
				if (baseParts.length > 0) baseParts.pop();
			} else {
				baseParts.push(part);
			}
		}

		return '/' + baseParts.join('/');
	}

	//try {

	await include("panic");
	await include("drivers");
	await include("processes")
	await include("vfs")
	await include("fs")

	const faviconSVG = await system.fs.readFile("/System/icons/.favicon.svg")
	if (faviconSVG !== undefined) {
		const favicon = document.getElementById("pg_favicon")
		favicon.href = faviconSVG
	}

	let sysState = await system.fs.readFile("/sysState.json")

	if (sysState !== undefined) {
		if (sysState.isNew == true) {
			system.isNew = true
		} else {
			system.isNew = false
		}
		await system.fs.deleteFile("/sysState.json")
	}


	await include("calls")
	await include("users")
	await include("devsys")
	await include("dsm")
	await include("gamepad")

	if (system.development == true) {
		await include("devmode")
	}


	await system.fs.writeFile("/System/logs/castoreaKernel.log", system.logs)
	system.logs = await system.fs.readFile("/System/logs/castoreaKernel.log")
	system.refreshLogsPanel()

	if (system.isNew) {
		// install system
		let packages = await system.fetchURL(system.baseURI + "/index.json")
		system.index = JSON.parse(packages).packages
	}

	await system.startProcess(PID, "/System/apps/utils/aurora.js", ["sources", "add", "http://localhost:5079"]) // source local for devs
	await system.startProcess(PID, "/System/apps/utils/aurora.js", ["sources", "add", "https://aurora-pkgs.vercel.app"]) // source the repo for installs


	if (system.isNew) {
		await system.startProcess(PID, "/System/apps/utils/aurora.js", ["index"]) // update package repositories

		await system.startProcess(PID, "/System/apps/utils/aurora.js", ["install", "aurora", "-s"])

		// install
		await system.startProcess(PID, "/System/apps/utils/aurora.js", ["install", system.index, "-s"])

		delete system.index // remove the index from memory

		system.log(Name, "System successfully Installed!")
	}


	document.title = await system.fs.readFile('/System/info/hostname')

	system.display = document.getElementById("display");
	system.refreshDisplay = function () {

		if (system.devices.display.owner !== 0) {
			return
		}

		if (system.focus.length !== 0) {
			system.display.innerHTML = processes[system.mainFcs].display
		} else {
			system.display.innerHTML = "No Application is outputting display information. Sorry, You'll have to restart the system, there is no real way to access a CLI from here."
		}
	}

	system.maxPID = 0

	system.log(Name, "Starting init system...")
	const init = await system.fs.readFile("/System/init.js")
	await system.startProcess(PID, init, [], undefined, "root", false, { type: "k" })

	system.log(Name, "Beginning to run processes...")

	system.runtime = setInterval(function () {
		try {

			for (let i = 0; i < system.runsPerMS; i++) {
				system.runProcesses();
				system.handleDisplay();
			};

		} catch (e) {
			system.kernelPanic(e, "PROCESS RUNNER")
		}
	}, 0);

	setTimeout(system.localFS.commit, 1000)
	system.commit = setInterval(system.localFS.commit, 10000)
	//} catch (e) {
	//	system.kernelPanic(e, "UNKNOWN")
	//}
}

return start_kernel;