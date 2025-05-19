const getDirInfo = system.fs.getDirInfo
const getVFS = system.fs.getVFS

// File operations
system.fs.readFile = (directory, attribute = "contents", username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.readFile(obj.vfsDir, attribute, username, obj.vfs, obj.vfsGUID)
}

system.fs.writeFile = (directory, content, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.writeFile(obj.vfsDir, content, username, obj.vfs, obj.vfsGUID)
}

system.fs.deleteFile = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.deleteFile(obj.vfsDir, username, obj.vfs, obj.vfsGUID)
}


// Folder operations
system.fs.listFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.listFolder(obj.vfsDir, username, obj.vfs, obj.vfsGUID)
}

system.fs.writeFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.writeFolder(obj.vfsDir, username, obj.vfs, obj.vfsGUID)
}

system.fs.deleteFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.deleteFolder(obj.vfsDir, username, obj.vfs, obj.vfsGUID)
}

system.fs.rawFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.rawFolder(obj.vfsDir, username, obj.vfs, obj.vfsGUID)
}

system.fs.isFolder = (directory) => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.isFolder(obj.vfsDir, obj.vfs)
}

system.fs.folderPermissions = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.folderPermissions(obj.vfsDir, username, obj.vfs, obj.vfsGUID)
}


// Typeless operations (files AND folders)
system.fs.exists = (directory) => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.exists(obj.vfsDir, obj.vfs)
}

// mount and unmount locations

system.newVFS("/", system.memory.kernel.rootFS, false, "localcfs", system.volumeGUID)

const memcfsDriver = await system.fs.readFile("/System/drivers/fs/memcfs.js")

system.memory.kernel.tempVFS = system.blankVFS()
system.newVFS("/tmp", system.memory.kernel.tempVFS, false, "memcfs")

system.memory.kernel.procVFS = system.blankVFS()
system.newVFS("/proc", system.memory.kernel.procVFS, false, "memcfs")

system.fsinit = true


setInterval(async () => {
    for (const i in system.writeFileQueue) {
        const item = system.writeFileQueue[0]

        await system.fs.writeFile(item.directory, item.content, "root")

        system.writeFileQueue.splice(0, 1)
    } 
}, 10000)

system.volumes = system.fsBackend.partitions.volumes
system.volume = system.volumes[system.volumeGUID]

system.localFS = {
    commit: async () => {

        const volType = system.volume.metadata.fsType

        await system.drivers[volType].onUpdate(
            initram.volumeGUID,
            system.memory.kernel.rootFS
        )
        console.debug("Filesystem committed to hostOS [" + navigator.platform + "]")
    }
}