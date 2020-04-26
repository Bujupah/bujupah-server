let express = require('express');
let ParseDashboard = require('parse-dashboard');
let http = require('http');

let dashboard = new ParseDashboard({
    apps: [
        {
            appId: 'Najda',
            masterKey: 'NajdaMaster',
            serverURL: 'http://localhost:1337/parse',
            appName: 'Najda',
        },
    ],
    users: [
        {
            user: 'admin',
            pass: 'admin'
        }
    ]
}, true); 

let app = express();

app.use('/', dashboard);

var port = process.env.PORT || 4040;
var httpServer = http.createServer(app);

httpServer.listen(port, function () {
    console.log('parse-dashboard running on port ' + port + '.');
});
