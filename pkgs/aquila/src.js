// Aquila Shell

function init() {

    const aquila = {
		history: []
	}

	window.aquila = aquila

    aquila.run = async function(code) {
    	let segments = String(code).split(" ")
    	const path = system.path
        aquila.history.push(code)
    	let cmd
    	for (const i in path) {
    		let temp = path[i] + "/" + segments[0]
    		if (system.files.get(temp) !== undefined) {
				cmd = String(temp)
				break;
    		} else {
				temp = path[i] + "/" + segments[0] + ".js"
				if (system.files.get(temp) !== undefined) {
					cmd = String(temp)
					break;
				}
			}
    	}
    	if (system.files.get(cmd) == undefined) {
    		try {
    			system.post(Name, eval(code))
    		} catch (e) {
    			system.post(Name, "Unknown Command: " + code + ". it is not valid JavaScript OR a valid Terminal command.")
    		}
    	} else {
    		system.startProcess(cmd, segments.slice(1))
    	}
    }

	function destring(string) {
		let str = string
		str = str.trimLeft()
		str = str.trimRight()
		return str
	}

	aquila.splitAndRun = function (code, pre, silent) {
		if (!silent) system.post("", pre + code)
		const split = code.split(";")

		for (const i in split) {
			split[i] = destring(split[i])
			aquila.run(split[i])
		}
	}

    window.cliEval = aquila.splitAndRun

	if (window.cliEval !== undefined) {
		system.log(Name, "Aquila Booted and Running")
		return
	}
	system.error(Name, "Aquila Failed to start.")
}

function frame() {

}