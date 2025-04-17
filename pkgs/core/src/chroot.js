#! /usr/bin/node

// change process' root

function init([root]) {
    csw.processes.chroot(parent.PID, root)
}