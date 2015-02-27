var io = require('socket.io-client');
var prompt = require('prompt');
var Chance = require('chance');

var socket = io.connect('http://localhost:3000');
var username = "";

socket.on('connect', function() {
    console.log("client socket connected");
    prompt.start();
    prompt.get(['username'], function(err, result) {
        socket.emit('request connection', result.username);
    });
});

socket.on('connection successfull', function(name) {
    if (username == "") {
        username = name;
        console.log("I'm connected as " + name);
        setTimeout(function() {
            socket.emit('hi message', {
                user: username,
                msg: "Hi..."
            });
        }, 2000);
    }
})

socket.on('chat message', function(data) {
    var chance = new Chance();
    if (data.response == username) {
        setTimeout(function() {
            socket.emit('chat message', {
                user: username,
                msg: chance.sentence()
            });
        }, 5000);
    }
});

socket.on('welcome message', function(data) {
    if (data.user == username) 
        socket.emit('chat message', {
        user: username,
        msg: "Hi " + data.newUser
    });
});