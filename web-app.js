// Load the http module to create an http server.
var http = require('http');
var express = require('express');
var bodyParser = require("body-parser");
var port = 8000;
var app = express();


app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function (req, res) {
    res.sendFile('/home/pi/NodeTest/Index.html');
});


app.get('/get-pedals-response', function (req, res) {
    request("pedals", req, http, res);
});


app.get('/get-songs-response', function (req, res) {
    request("songs", req, http, res);
});


app.get('/get-sets-response', function (req, res) {
    request("sets", req, http, res);
});


var server = app.listen(port, function () {
    // Put a friendly message on the terminal
    console.log("Server running at http://127.0.0.1:" + port + "/", );
});


function request(apiStr, req, http, res){
    var address = '127.0.0.1:8081';
    http.get("http://" + address + "/" + apiStr, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          console.log(data);
          res.send(data);
        });
        // JSON.parse(data).explanation
    }).on("error", (err) => {
    console.log("Error: " + err.message);
    });
}
