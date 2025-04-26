const getArgs = (args) => args.reduce((args, arg) => {
    if (arg.slice(0, 2) === "--") {
        // specific values
        const longArg = arg.split("=");
        const longArgFlag = longArg[0].slice(2);
        const longArgValue = longArg.length > 1 ? longArg[1] : true;
        args[longArgFlag] = longArgValue;
    } else if (arg[0] === "-") {
        // flags
        const flags = arg.slice(1).split("");
        flags.forEach((flag) => {
            args[flag] = true;
        });
    } else {
        // text data
        args.data.push(arg);
    }
    return args;
}, {data: []});
const ARGUEMENTS = getArgs(args);
if (ARGUEMENTS.data == undefined) {
    ARGUEMENTS.data = [];
};