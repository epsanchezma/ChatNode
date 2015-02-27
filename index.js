var express = require('express');
var http = require('http');
var io = require('socket.io')(http);
var Chance = require('chance');
var underscore = require('underscore');

var bots = []; 
var allClients = [];
var count = 1;
var app = express();


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var server = http.createServer(app).listen(3000, function() {
    console.log("Express server listening on port 3000");
});

io = io.listen(server);

io.on('connection', function(socket) {
    var globalSocket = socket;
    globalSocket.on('request connection', function(name) {
        if (underscore.indexOf(bots, name) == -1) {
            globalSocket.emit("connection successfull", name);
            completeConnection(name);
        } else {
            globalSocket.emit("connection successfull", name + count);
            completeConnection(name + count);
            count++;
        }
    })

    function completeConnection(name) {
        var chance = new Chance();
        io.emit('general message', {
            "user": "",
            "msg": "--------------" + name + " has joined the room"
        });

        if (bots.length > 0) {
            underscore.each(bots, function(element, index) { 
                if (element != name) 
                    io.emit('welcome message', {
                    user: element,
                    newUser: name
                });
            });
        }

        bots.push(name);
        allClients.push(globalSocket);

        globalSocket.on('chat message', function(data) { 
            if (bots.length > 1) {
                var botsFilter = underscore.without(bots, data.user); 
                io.emit('chat message', {
                    "user": data.user,
                    "msg": data.msg,
                    "response": chance.pick(botsFilter)
                });
            }
        });


        globalSocket.on('hi message', function(data) { 
            io.emit('hi message', {
                "user": data.user,
                "msg": data.msg
            });
        });


        globalSocket.on('disconnect', function() {
            var i = underscore.indexOf(allClients, globalSocket);
            allClients = underscore.without(allClients, allClients[i]);
            var disconnectedUser = bots[i];
            setTimeout(function() {
                io.emit('general message', {
                    "user": "",
                    "msg": "--------------" + disconnectedUser + " just left the room"
                });
            }, 5000);
            bots = underscore.without(bots, bots[i]);
            
            io.emit('chat message', {
                "user": chance.pick(bots),
                "msg": chance.sentence(),
                "response": chance.pick(bots)
            });
        });
    }

});