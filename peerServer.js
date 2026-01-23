const express = require("express");
const { ExpressPeerServer } = require("peer");
const axios = require('axios').default;
const fs = require('fs');
const https = require('https');

const app = express();

// Set up minimalist view engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Load Certificates once at startup (prevents slow Disk I/O during handshakes)
const sslOptions = {
    key: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.key'),
    cert: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.crt')
};

// Endpoints
app.get('/', (req, res) => {
    res.type('html').render('index'); 
});

app.get('/serverTest', (req, res) => {
    res.type('html').render('ServerTest'); 
});

app.get('/health', (req, res) => {
    res.status(200).json({ healthy: "Good", timestamp: Date.now() }); 
});

// Create HTTPS Server
const server = https.createServer(sslOptions, app).listen(443);

// OPTIMIZED PeerServer Configuration
const peerServer = ExpressPeerServer(server, {
    key: "AknsDfy9we7rnkjsdf70ndSDGHyekjb",
    path: "/signal",
    allow_discovery: false, // PERFORMANCE: Disables peer listing, saves massive CPU/RAM
    proxied: true,           // PERFORMANCE: Optimized for Bitnami/Apache reverse proxy
    alive_timeout: 15000,    // PERFORMANCE: Cleans up dead connections every 15s
    concurrent_limit: 5000   // SCALABILITY: High ceiling for your t2.micro scaling
});

// Event Listeners
peerServer.on('connection', (client) => {
    console.log('New Connection:', client.id);
    // Fire-and-forget: Don't 'await' stats to keep the signaling handshake instant
    postStat(true, client.id);
});

peerServer.on('disconnect', (client) => {
    console.log('Connection Ended:', client.id);
    postStat(false, client.id);
});

// Mount the optimized signal path
app.use("/bantr_signal", peerServer);

/**
 * High-Performance Stat Reporting
 * We remove 'await' from the loop to ensure the Node event loop 
 * focuses on WebRTC signaling, not waiting for API responses.
 */
async function postStat(status, id) {
    const data = {
        user_id: id,
        status: status
    };
    
    try {
        // Using a background POST keeps the 'Enter Chat' transition seamless for users
        await axios.post(`https://bantr.live/api/socket`, data, { timeout: 2000 });
    } catch (error) {
        // Log locally but don't crash the signaling process
        console.error('Stat Report Failed:', error.message);
    }
}


// const express = require("express");
// const { ExpressPeerServer } = require("peer");
// const axios = require('axios').default;
// const fs = require('fs');
// const https = require('https');

// const app = express();
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
// app.set('views', __dirname+'/views');

//   app.get('/', (req, res) => {
//     res.type('html');
//     res.render('index'); 
//   });
//   app.get('/serverTest', (req, res) => {
//     res.type('html');
//     res.render('ServerTest'); 
//   });
//   app.get('/health', (req, res) => {
//     res.type('json');
//     res.status(200).send({healthy:"Good"}) 
//   });

// const server = https.createServer({
//     key: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.key'),
//     cert: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.crt')
// },app).listen(443);
// const peerServer = ExpressPeerServer(server, {
//     key:"AknsDfy9we7rnkjsdf70ndSDGHyekjb",
//     ssl: {
//         key: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.key'),
//         cert: fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.crt')
//         	},
// 	path: "/signal",
// });
// peerServer.on('connection', async (client) => {
//     console.log('New Connection',client.id);
//     // await postStat(true,client.id);
// });
// peerServer.on('disconnect', async (client) => {console.log('Connection Ended',client.id);
//     // await postStat(false,client.id);
// });

// app.use("/bantr_signal", peerServer);
// async function postStat(status,id){
//     const data = {
//       user_id:id,
//       status:status
//     }
    
//     try {
//         const response = await axios.post(`https://bantr.live/api/socket`, data);
//         console.log(response);
//       } catch (error) {
//         console.error(error);
//       }
    
     
//     }

