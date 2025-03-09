document.onkeydown = updateKey;
document.onkeyup = resetKey;

var server_port = 65426;
var server_addr = "192.168.137.65";   // the IP address of your Raspberry PI
var mainIntervalId = null
var intervalId = null

function client(){
    
    const net = require('net');

    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        // 'connect' listener.
        console.log('connected to server!');
        client.write(`connecting\r\n`);
    });
    
    // get the data from the server
    client.on('data', (data) => {
        if(data){
            const { temp } = JSON.parse(data.toString())
            document.getElementById("temperature").innerHTML = `${temp}°C` ?? '0°C';
            console.log(data.toString());
        }
        client.end();
        client.destroy();
    });

    client.on('end', () => {
        console.log('disconnected from server');
    });
}

function send_data(keyCode) {
    const net = require('net');
    
    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        console.log('connected to server!');
        client.write(`${keyCode}\r\n`);
    });

    client.on('data', (data) => {
        if(data){
            const { key, power } = JSON.parse(data.toString())
            document.getElementById("direction").innerHTML = key ?? '0.0';
            document.getElementById("speed").innerHTML = `${power}%` ?? '0.0%';
            if(key == "\r\n") {
                document.getElementById("direction").innerHTML = "Stop";
                document.getElementById("speed").innerHTML = '0.0%';
            }
            console.log(data.toString());
        }
        client.end();
        client.destroy();
    });
}

// for detecting which key is been pressed w,a,s,d
function updateKey(e) {
    if(mainIntervalId !== null && intervalId !== null) {
        return 
    }
    
    e = e || window.event;
    let keyCode = null
    if (e.keyCode == '87') {
        // up (w)
        document.getElementById("upArrow").style.color = "green";
        keyCode = "up";
    }
    else if (e.keyCode == '83') {
        // down (s)
        document.getElementById("downArrow").style.color = "green";
        keyCode = "down";
    }
    else if (e.keyCode == '65') {
        // left (a)
        document.getElementById("leftArrow").style.color = "green";
        keyCode = "left";
    }
    else if (e.keyCode == '68') {
        // right (d)
        document.getElementById("rightArrow").style.color = "green";
        keyCode = "right";
    }

    if (keyCode) {
        send_data(keyCode);
        intervalId = setInterval(() => {
            console.log(1111)
            send_data(keyCode);
        }, 500);
    }
}

// reset the key to the start state 
function resetKey(e) {

    e = e || window.event;

    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }

    send_data('')

    document.getElementById("upArrow").style.color = "grey";
    document.getElementById("downArrow").style.color = "grey";
    document.getElementById("leftArrow").style.color = "grey";
    document.getElementById("rightArrow").style.color = "grey";
}


// update data for every 50ms
function update_data(){
    if(mainIntervalId !== null) {
        document.getElementById("start_button").innerHTML = "Start monitor";     
        clearInterval(mainIntervalId);
        mainIntervalId = null;
    } else {
        document.getElementById("start_button").innerHTML = "Monitering...";
        mainIntervalId = setInterval(function(){
            // get image from python server
            client();
        }, 500);
    }
}
