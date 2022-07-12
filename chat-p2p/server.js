const { v4: uuidv4 } = require('uuid');
const {DEBUG, PORT, HOST} = require('./configuration');

const netLib = require('net');
const server = new netLib.Server();

let allSockets = [];

const writeBroadcast = (message) => {
    serverLog(`[ALL] ${message}`)
    allSockets.map((socketElement) => {
        socketElement.write(message);
    });
}

const serverLog = (message, options = { isDebugOnly: false }) => { 
    if(!options.isDebugOnly || (options.isDebugOnly && DEBUG)){ 
        console.log(`[SERVER] ${message}`) 
    }
};

let processMessage = ({ command, message }, socket) => {
    if(command == 'message' || command == 'm') {
        writeBroadcast(`[CHAT] ${socket.name}: ${message}`);
    }

    if(command == 'name') {
        socket.name = message;
        serverLog(`[ACTION] ${socket.id} has the username ${message}`, {isDebugOnly: true});
    }
}

server.listen(PORT, function() {
    serverLog(`Server on ${HOST}:${PORT}`);
});

server.on('connection', function(socket) {
    let id = uuidv4();
    serverLog(`New client!`, {isDebugOnly: true});

    socket.id = id;
    socket.write('You are connected');

    allSockets.push(socket);

    socket.on('data', function(chunk) {
        let receivedInfo = chunk.toString();
        serverLog(`Data received: ${receivedInfo}`, {isDebugOnly: true});

        try{
            let messageObject = JSON.parse(receivedInfo);
            processMessage(messageObject, socket)
        } catch (e) {
            serverLog(`Error reading object`);
        }
    });

    socket.on('end', function() {
        serverLog(`Bye, ${socket.name} see you`, {isDebugOnly: true});
    });

    socket.on('error', function(err) {
        serverLog(`Error: ${err}`);
    });
});