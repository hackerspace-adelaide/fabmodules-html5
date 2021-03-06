//
// mod_server.js
//   fab module server
//
// Neil Gershenfeld 
// (c) Massachusetts Institute of Technology 2014
// 
// This work may be reproduced, modified, distributed, performed, and 
// displayed for any purpose, but must acknowledge the fab modules 
// project. Copyright is retained and must be preserved. The work is 
// provided as is; no warranty is provided, and users accept all 
// liability.
//

//
// sudo apt-get install nodejs nodejs-legacy npm
// npm config set registry http://registry.npmjs.org/
// npm install ws
// node mod_server.js
//

var server_port = '12345'
var client_address = '127.0.0.1'

console.log("listening for connections from " + client_address + " on " + server_port)

var exec = require('child_process').exec
var WebSocketServer = require('ws').Server
var fs = require('fs')

wss = new WebSocketServer({
   port: server_port
})
wss.on('connection', function(ws) {
   if (ws._socket.remoteAddress != client_address) {
      console.log("error: client address doesn't match")
      return
   }
   ws.on('message', function(data) {
      var msg = JSON.parse(data)

      if (!msg.file_command) {
        ws.send("error: " + 'No send command specified');
        return;
      }
      fs.writeFile(msg.file_name, msg.file_body, function(err) {
         if (err) {
            ws.send("error: failed to write temporary file, " + err.message)
         }

         var cmd = msg.file_command + ' "' + msg.file_name + '"';
         var child = exec(cmd, function(error, stdout, stderr) {
            fs.unlink(msg.file_name, function(err) {
               if (err) throw err
            })
            console.log("command completed: " + stdout)
            if (error == null) {
               ws.send('sent ' + msg.file_name)
            } else {
               console.log("error: " + stderr)
               ws.send("error: " + stderr)
            }

         });
      });
   });
});
