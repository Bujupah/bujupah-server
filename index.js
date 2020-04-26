const { default: ParseServer, ParseGraphQLServer } = require('parse-server');
const express = require('express');
const path = require('path');
const http = require('http');
const ParseDashboard = require('parse-dashboard');

var databaseUri = 'mongodb://localhost:27017/dhayefni';

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

var parseServer = new ParseServer({
    cloud: __dirname + '/cloud/main.js',
    databaseURI: databaseUri,
    appName: 'Dhayefni',
    appId: 'dhayefniAppId',
    masterKey: 'dhayefniMasterKey',
    clientKey: 'dhayefniClientKey',
    javascriptKey: 'dhayefniJavascriptKey',
    restApiKey: 'dhayefniApiKey',
    fileKey: 'dhayefniFileKey',
    webhookKey: 'dhayefniWebhookKey',
    dotNetKey: 'dhayefniDotNetKey',
    serverURL: 'http://localhost:1337/parse',
    publicServerURL: 'http://localhost:1337/parse',
    verifyUserEmails: false,
    emailVerifyTokenValidityDuration: 24 * 60 * 60,
    preventLoginWithUnverifiedEmail: false,
    emailAdapter: {
        module: 'parse-smtp-template',
        options: {
            port: 587,
            host: "smtp.mail.com",
            user: "email@domain.com",
            password: "password",
            fromAddress: 'info@dhayefna.tn',
            template: true,
            templatePath: "views/templates/template.html",
        }
    },
    accountLockout: {
        duration: 5, // threshold policy setting determines the number of failed sign-in attempts that will cause a user account to be locked. Set it to an integer value greater than 0 and less than 1000.
        threshold: 3, // duration policy setting determines the number of minutes that a locked-out account remains locked out before automatically becoming unlocked. Set it to a value greater than 0 and less than 100000.
    },
    passwordPolicy: {
        validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, // enforce password with at least 8 char with at least 1 lower case, 1 upper case and 1 digit
        // validatorCallback: (password) => { return validatePassword(password) },
        validationError: 'Password must contain at least 1 digit.', // optional error message to be sent instead of the default "Password does not meet the Password Policy requirements." message.
        doNotAllowUsername: true, // optional setting to disallow username in passwords
        maxPasswordAge: 90, // optional setting in days for password expiry. Login fails if user does not reset the password within this period after signup/last reset.
        maxPasswordHistory: 5, // optional setting to prevent reuse of previous n passwords. Maximum value that can be specified is 20. Not specifying it or specifying 0 will not enforce history.
        resetTokenValidityDuration: 24*60*60, // expire after 24 hours
    },
    customPages: {
        passwordResetSuccess: "http://localhost:1337/passwordResetSuccess",
        verifyEmailSuccess: "http://localhost:1337/verifyEmailSuccess",
        linkSendSuccess: "http://localhost:1337/linkSendSuccess",
        linkSendFail: "http://localhost:1337/linkSendFail",
        invalidLink: "http://localhost:1337/invalidLink",
        invalidVerificationLink: "http://localhost:1337/invalidVerificationLink",
        choosePassword: "http://localhost:1337/choosePassword",
        parseFrameURL: "http://localhost:1337/parseFrameURL",
    },
    liveQuery: {
        classNames: ['_User']
    }
});


const parseGraphQLServer = new ParseGraphQLServer(
    parseServer,
    {
      graphQLPath: '/graphql',
      playgroundPath: '/playground'
    }
  );

let dashboard = new ParseDashboard({
    apps: [
        {
            appName: 'Dhayefni',
            appId: 'dhayefniAppId',
            masterKey: 'dhayefniMasterKey',
            clientKey: 'dhayefniClientKey',
            javascriptKey: 'dhayefniJavascriptKey',
            restApiKey: 'dhayefniApiKey',
            graphQLServerURL: "http://localhost:1337/graphql",
            serverURL: 'http://localhost:1337/parse',
            iconName: "logo.png"
        },
    ],
    iconsFolder: "icons",
    users: [
        {
            user: 'admin',
            pass: 'admin'
        }
    ]
}, true); 



var app = express();

// This will host the ParseServer on /parse
app.use('/parse', parseServer.app);
// This will host the dashboard on /dashboard
app.use('/dashboard', dashboard);
// This will enable graphQL queries
parseGraphQLServer.applyGraphQL(app);
parseGraphQLServer.applyPlayground(app);

app.use('/public', express.static(path.join(__dirname, '/public')));
app.get('/test', function(req, res) {res.sendFile(path.join(__dirname, '/public/test.html'));});

app.get('/passwordResetSuccess', function(req, res) {res.sendFile(path.join(__dirname, '/public/password_reset_success.html'));});
app.get('/verifyEmailSuccess', function(req, res) {res.sendFile(path.join(__dirname, '/public/verify_email_success.html'));});
app.get('/linkSendSuccess', function(req, res) {res.sendFile(path.join(__dirname, '/public/link_send_success.html'));});
app.get('/linkSendFail', function(req, res) {res.sendFile(path.join(__dirname, '/public/link_send_fail.html'));});
app.get('/invalidLink', function(req, res) {res.sendFile(path.join(__dirname, '/public/invalid_link.html'));});
app.get('/invalidVerificationLink', function(req, res) {res.sendFile(path.join(__dirname, '/public/invalid_verification_link.html'));});
app.get('/choosePassword', function(req, res) {res.sendFile(path.join(__dirname, '/public/choose_password.html'));});

var port = 1337;
var httpServer = http.createServer(app);

httpServer.listen(port, function() {
    console.log('Dhayefni server is now running on port ' + port + '.');
    console.log(`server URL: http://localhost:${port}/parse`);
    console.log(`Dashboard URL: http://localhost:${port}/`);
    console.log(`GraphQL URL: http://localhost:${port}/playground`);
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
