#! /System/apps/compilers/js

async function init([attribute]) {
    const userData = await call.usrinf()

    console.debug(userData)

    std.out = userData[attribute]
}