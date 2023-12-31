/*
    p5.js MQTT Client example
    This example uses p5.js: https://p5js.org/
    and the Eclipse Paho MQTT client library: https://www.eclipse.org/paho/clients/js/
    to create an MQTT client that sends and receives MQTT messages.
    The client is set up for use on the shiftr.io test MQTT broker,
    but other options listed will work.

    created 12 June 2020
    modified 31 Dec 2022
    by Tom Igoe
*/

// All these brokers work with this code. 
// Uncomment the one you want to use. 

////// emqx. Works in both basic WS and SSL WS:
// const broker = 'broker.emqx.io'
// const port = 8083;   // no SSL
// const broker = 'broker.emqx.io'
// const port = 8084;   // SSL

//////// shiftr.io desktop client. 
// Fill in your desktop URL for localhost:
// const broker = 'localhost';   
// const port = 1884;  //  no SSL

//////// shiftr.io, requires username and password 
// (see options variable below):
const broker = 'public.cloud.shiftr.io';
const port = 443;

//////// test.mosquitto.org, uses no username and password:
// const broker = 'test.mosquitto.org';
// const port = 8081;

// MQTT client:
let client;
// client credentials:
let clientID = 'EclipsePahoClient';

let options = {
  // Clean session
  cleanSession: true,
  // connect timeout in seconds:
  timeout: 10,
  // callback function for when you connect:
  onSuccess: onConnect,
  // username & password:
  userName: 'public',
  password: 'public',
  // use SSL
  useSSL: true
};

// topic to subscribe to when you connect:
let topic = 'notes';
// divs to show messages:
let localDiv, remoteDiv;
// whether the client should be publishing or not:
let publishing = true;
let connected = false;

// a pushbutton to send messages
let sendButton;
// intensity of the circle in the middle
let intensity = 255;

function setup() {
    createCanvas(400, 400);
    // Create an MQTT client:
    client = new Paho.MQTT.Client(broker, port, clientID);
    // set callback handlers for the client:
    client.onConnectionLost = onDisconnect;
    client.onMessageArrived = onMessage;
    // connect to the MQTT broker:
    client.connect(options);
    // create the send button:
    sendButton = createButton('send a message');
    sendButton.position(20, 20);
    sendButton.mousePressed(sendMqttMessage);
    // create a div for local messages:
    localDiv = createDiv('local messages will go here');
    localDiv.position(20, 50);
    localDiv.style('color', '#fff');
    // create a div for the response:
    remoteDiv = createDiv('waiting for messages');
    remoteDiv.position(20, 80);
    remoteDiv.style('color', '#fff');
}

function draw() {
    background(50);
    // draw a circle whose brightness changes when a message is received:
    fill(intensity);
    circle(width/2, height/2, width/2);
// subtract one from the brightness of the circle:
    if (intensity > 0) {
        intensity--;
    }
}

// called when the client connects
function onConnect() {
    localDiv.html('client is connected');
    client.subscribe(topic, {onSuccess: onSubscribe});
}

function onSubscribe(response) {
    // update localDiv text:
    localDiv.innerHTML = JSON.stringify(response)
    +'<br>Subscribed to ' + topic;
}

// called when the client loses its connection
function onDisconnect(response) {
    if (response.errorCode !== 0) {
        localDiv.html('disconnect:' + response.errorMessage);
    }
}

// called when a message arrives
function onMessage(message) {
    remoteDiv.html('I got a message:' + message.payloadString);
    let  incomingNumber = parseInt(message.payloadString);
    if (incomingNumber > 0) {
        intensity = 255;
    }
}

// called when you want to send a message:
function sendMqttMessage() {
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {
        // make a string with a random number form 0 to 15:
        let msg = String(round(random(15)));
        // start an MQTT message:
        message = new Paho.MQTT.Message(msg);
        // choose the destination topic:
        message.destinationName = topic;
        // send it:
        client.send(message);
        // print what you sent:
        localDiv.html('I sent: ' + message.payloadString);
    }
}