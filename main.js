function h(){
    evaluatedvalue = ws.readyState;
    listofreadystates = ["Connecting...","Connected!","Disconnecting...","Disconnected."];
    alert(listofreadystates[evaluatedvalue]);
}

function startws(){
    function coding(obj) {
        return Function(document.querySelector("#code").value)();
    }
    coding();

    ws = new WebSocket("wss:\/\/server.meower.org");
    console.log(ws);
    ws.addEventListener("message", function (ev) {
        prz = JSON.parse(ev.data);
        console.log(prz);

        if (prz.cmd == "ping") {
            if (prz.val == "I:100 | OK") {
                console.log("PINGBACK OK");
            } else {
                console.log("PINGBACK NOT OK");
            }
        }

        if (prz.cmd == "direct") {
            if (prz.val.isDeleted === false) {
                console.log(`Post received from ${prz.val.u}: ${prz.val.p}`);

                handlePost([prz.val.u, prz.val.p]);
            }
        }

        if (prz.cmd == "ulist") {
            document.querySelector("#ulist").innerText = `Online: ${prz.val.split(";").slice(0,prz.val.split(";").length-1).join(", ")}`;
        }

        if (prz.cmd == "statuscode") {
                if (prz.val == "I:112 | Trusted Access enabled") {
                    auth(document.querySelector("#username").value, document.querySelector("#password").value);
                } else {
                    if (prz.val != "I:011 | Invalid Password") {
                        alert("You have typed an invalid password (or left the field blank).");
                        ws.close();
                    }
                }
        }
    });
}

function auth(user,pass){
        ws.send('{"cmd": "direct", "val": {"cmd": "type", "val": "js"}}');
        ws.send(`{"cmd": "direct", "val": {"cmd": "ip", "val": "${window.ipAdd}"}}`);
        ws.send('{"cmd": "direct", "val": "meower"}');
        ws.send('{"cmd": "direct", "val": {"cmd": "version_chk", "val": "scratch-beta-5-r7"}}');
        ws.send(`{"cmd": "direct", "val": {"cmd": "authpswd", "val": {"username": "${user}", "pswd": "${pass}"}}}`);

        setInterval(function(){ws.send('{"cmd":"ping","val":""}')}, 15000)
}

function post(content){
        ws.send(`{"cmd":"direct","val":{"cmd":"post_home","val":"${content}"}}`);
}

function setting(b){
        ws.send('{"cmd":"direct","val":{"cmd":"update_config","val":{"theme":"orange","mode":false,"sfx":true,"bgm":true,"bgm_song":17,"layout":"new","pfp_data":101,"quote":""}}}');
}

//code lifted from turbo_networking.js
async function fetchURL(url) {
		const res = await fetch(url, {
        method: "GET"
    });
    return await res.text();
};

async function checkstatus(){
    try {
        var apistatus = await fetchURL("https://api.meower.org/status");
    } catch (error) {
        meowerdown = true;
        return true;
    }
        
    apistatus = JSON.parse(apistatus);

    if (apistatus.isRepairMode === false & apistatus.scratchDeprecated === false & apistatus !== undefined) {
        console.log("suces");
        meowerdown = false;
    } else {
        console.log("bad :(");
        meowerdown = true;
    }

    window.ipAdd = await fetchURL("https://api.meower.org/ip");
}

checkstatus();

document.querySelector("#code").value = `// Example Meower chatbot code

function handlePost(bundle) {
    if (bundle[0] == "Discord") {
        bundle = bundle[1].split(": ")
    }

    // Bot code goes here

    if (bundle[1].startsWith("!helloworld")) {
        post(\`Hello \${bundle[0]}!\`);
    }
}

// Posts are stored as an array in this format:
// ["user", "content"]`