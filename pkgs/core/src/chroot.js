#! /usr/bin/node

// change process' root

async function init([root]) {
    await call.chroot(parent.PID, root)
}