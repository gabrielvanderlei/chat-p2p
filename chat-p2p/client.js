const {DEBUG, PORT, HOST} = require('./configuration');

const netLib = require('net');
const client = new netLib.Socket();

const clientLog = (message, options = { isDebugOnly: false }) => { 
    if(!options.isDebugOnly || (options.isDebugOnly && DEBUG)){ 
        console.log(`[CLIENT] ${message}`) 
    }
};

const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

let processMessage = (command, message) => {
    clientLog(`Command: ${command} / Message: ${message}`, {isDebugOnly: true});

    if(command == 'quit'){
        clientLog('Bye');
        client.end();
        rl.close();
    } else {
        client.write(JSON.stringify({
            command,
            message
        }));
    }
}

const startProcessing = () => {
    clientLog(`Message format: [command] content.`)
    clientLog(``)
    clientLog(`Command examples.`)
    clientLog(`> message hi`)
    clientLog(`> quit now`)
    clientLog(``)

    rl.on('line', (message) => {
        let messageSplitted = message.split(' ');
    
        if(messageSplitted.length > 1){
            let command = messageSplitted.shift();
            let message = messageSplitted.join(' ');

            processMessage(command, message);
        } else {
            clientLog(`Message format: [command] content. Example: message hi`)
        }
    });
}

client.connect({ port: PORT, host: HOST }, function() {
    clientLog(`Connected!`);
    
    rl.question('What is your username? ', (username) => {
        processMessage('name', username)
        startProcessing();

        client.on('data', function(chunk) {
            console.log(`[SERVER] ${chunk.toString()}.`);
        });
    });
});

client.on('end', function() {
    clientLog('Disconnected');
    client.end();
    rl.close();
});