// /System/kernel/modules/stringUtils.js
String.prototype.textAfter = function (after) {
    return this.substring(this.indexOf(after) + String(after).length);
};

String.prototype.textBefore = function (before) {
    return this.substring(0, this.indexOf(before));
};

String.prototype.textAfterAll = function (after) {
    return this.split(after).pop();
};

String.prototype.textBeforeLast = function (before) {
    return this.split("").reverse().join("").textAfter(before).split("").reverse().join("")
};






const smalltext = document.getElementById("smalltext");
smalltext.innerText = smalltext.innerText.replaceAll("[URI]", window.location.host);

async function main() {
    const fetchURL = async (URL, isJSON = false) => {
        const data = await fetch(URL);

        let result;

        if (isJSON) {
            result = await data.json();
        } else {
            result = await data.text();
        };
        return result;
    };

    const repos = await fetchURL("../repositories.json", true);
    const inf = {};

    let packages = {}

    for (const i in repos) {
        const repo = repos[i];

        inf[repo] = await fetchURL("../" + repo + "/repository.json", true);

        const versions = inf[repo].packages;

        const infa = {}

        // prefetch the info at the same time, so that it's all present faster.

        for (const pkg in versions) {
            const pkginfURI = "../" + repo + "/" + pkg + "/info.json"
            try {
                infa[pkg] = fetchURL(pkginfURI, true); // no await, this can be managed layer
            } catch (e) {
                const cont = document.getElementById("container");
                document.body.style.background = "black"
                cont.innerHTML = "<p>Repository " + repo + " has a non existent package listed: " + pkg + ".</p>";
                return;
            };
        }

        for (const pkg in versions) {

            let pkginf = await infa[pkg] // await now to insure request is finished

            packages[repo + "-" + pkg] = {
                ...pkginf,
                versions: versions[pkg]
            };
        };
    };

    let sortable = [];
    for (var id in packages) {
        sortable.push([id, packages[id]]);
    };

    sortable.sort(function (a, b) {
        const nameA = a[0].textAfter("-")
        const nameB = b[0].textAfter("-")

        if (nameA > nameB) {
            return 1
        } else {
            return -1
        }
    })

    const srcColours = {};
    const colours = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","grey","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightgrey","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
    let lastColor = -1;

    packages = {};
    for (const i in sortable) {
        const item = sortable[i];
        const repo = item[0].textBefore("-");

        packages[item[0]] = item[1];

        if (srcColours[repo] == undefined) {
            srcColours[repo] = colours[++lastColor];
        };
    }

    let tableHTML = "<tr>  <th>Repository</th>  <th>Name</th>  <th>Latest Build</th>  <th>Dependencies</th>  <th>Description</th>  </tr>"

    for (const id in packages) {
        const repo = id.textBefore("-")
        const pkg = id.textAfter(repo + "-")
        const pkginf = packages[id]

        let html = "<tr>";

        let desc = "";
        let dependencies = ""

        if (pkginf.desc !== undefined) {
            desc = pkginf.desc
        }
        if (typeof pkginf.dependencies == "object") {
            dependencies = pkginf.dependencies.length
        }

        html += `<th style="background-color: ${srcColours[repo]};"><p style="mix-blend-mode: difference;">` + repo + "</p></th>";
        html += "<th>" + pkg + "</th>";
        html += "<th>" + pkginf.versions + "</th>";
        html += "<th>" + dependencies + "</th>";
        html += "<th>" + desc + "</th>";

        html += "</tr>";

        tableHTML += html;
    }


    const table = document.getElementById("table");
    table.innerHTML = tableHTML


};

main();