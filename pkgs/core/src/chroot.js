#! /System/apps/compilers/js

// change process' root

async function init([root]) {
    await call.chroot(parent.PID, root)
}