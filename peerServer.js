const express = require("express");
const { ExpressPeerServer } = require("peer");
const axios = require('axios').default;
const fs = require('fs');
const https = require('https');

// const { log } = require("console");
// const path = require('path'); 
// const https = require("https");
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
  app.get('/health', (req, res) => {
    res.type('json');
    res.status(200).send({healthy:"Good"}) 
  });
async function postStat(status,id){
const data = {
  user_id:id,
  status:status
}

try {
    const response = await axios.post(`https://bantr.live/api/users`, data);
    console.log(response);
  } catch (error) {
    console.error(error);
  }

 
}



// const server = app.listen(9000);
const server = https.createServer({
    key: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.key'),
    cert: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.crt')
},app);
const peerServer = ExpressPeerServer(server, {
    key:"AknsDfy9we7rnkjsdf70ndSDGHyekjb",
    // port:443,
    ssl: {
        key: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.key'),
        cert: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.crt')
        	},
	path: "/signal",
});
peerServer.on('connection', async (client) => {
    console.log('New Connection',client.id);
    // await postStat(true,client.id);
});
peerServer.on('disconnect', async (client) => {console.log('Connection Ended',client.id);
    // await postStat(false,client.id);
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
