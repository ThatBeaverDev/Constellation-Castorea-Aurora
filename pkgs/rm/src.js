// delete files or directories

function init(args) {
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
            dir = csw.fs.toDirectory(args[i], parent.dir)
          } else {
            console.warn("Unknown flag: " + args[i])
          }
          i++
      }
    }


    const isDir = csw.fs.isDirectory(dir)

    if (isDir) {
        csw.fs.deleteDir(dir, obj.recursive, obj.verbose)
    } else {
        csw.fs.delete(dir)
    }
}