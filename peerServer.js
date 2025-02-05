const express = require("express");
const { ExpressPeerServer } = require("peer");
const path = require('path'); 

const app = express();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname+'/views');

app.get('/', (req, res) => {
    res.type('html');
    res.render('index'); 
  });
  app.get('/serverTest', (req, res) => {
    res.type('html');
    res.render('ServerTest'); 
  });




const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
    key:"AknsDfy9we7rnkjsdf70ndSDGHyekjb",
    // port:9000,
    // debug:true,
    // ssl: {
        // 	// 	key: fs.readFileSync("/path/to/your/ssl/key/here.key"),
        // 	// 	cert: fs.readFileSync("/path/to/your/ssl/certificate/here.crt"),
        // 	// },
	path: "/signal",
});
peerServer.on('connection', (client) => {console.log('New Connection',client.id);
});
peerServer.on('disconnect', (client) => {console.log('Connection Ended',client.id);
});

app.use("/bantr_signal", peerServer);

// const fs = require("fs");
// const { PeerServer } = require("peer");

// const peerServer = PeerServer({
// 	port: 9000,
//     path:'/switching'
// 	// ssl: {
// 	// 	key: fs.readFileSync("/path/to/your/ssl/key/here.key"),
// 	// 	cert: fs.readFileSync("/path/to/your/ssl/certificate/here.crt"),
// 	// },
// });
