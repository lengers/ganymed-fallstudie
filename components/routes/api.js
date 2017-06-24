const express = require('express')

const api = express.Router()

var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

var secret = "goodenoughforthedemo";

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysqlpass',
    database: 'Ganymed'
});

var bodyParser = require('body-parser')
api.use(bodyParser.json()); // to support JSON-encoded bodies
api.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

function check_jwt(token) {
    try {
        var decoded = jwt.verify(token.toString(), secret);
        return decoded;
    } catch (e) {
        return "invalid";
    }
}


api
    .get('/hello', (req, res) => {
        res.send('hello')
    })
    .post('/auth', (req, res) => {
        connection.query('SELECT * FROM user WHERE username = ?', [req.body.name], function(error, results, fields) {
            if (error) throw error;
            var hash = results[0].hash;
            var password_correct = bcrypt.compareSync(req.body.password, results[0].hash);
            if (password_correct) {
                // TODO: Implement groups like:
                //   var user_token = jwt.sign({user: req.params.name, group: TODO}, secret);
                var user_token = jwt.sign({
                    name: req.body.name,
                    group: results[0].group
                }, secret);
                res.json({
                    type: true,
                    data: req.body.name,
                    token: user_token
                });
            } else {
                res.json({
                    type: false,
                    data: req.body.name,
                    token: null
                });
            }
        });
    })
    .get('/auth/check', (req, res) => {
        var local_token = check_jwt(req.headers.token);
        if (local_token != "invalid") {
            res.json({
                status: "ok",
                data: local_token
            })
        } else {
            console.log("Token invalid.");
            res.json({
                status: "invalid"
            })
        }
    })
    .get('/devices', (req, res) => {
        var local_token = check_jwt(req.headers.token);
        if (local_token != "invalid") {
            try {
                connection.query('SELECT * FROM device;', [req.body.name], function(error, results, fields) {
                    if (error) throw error;
                    res.json({
                        status: "ok",
                        data: results
                    });
                });
            } catch (e) {
                res.json({
                    status: "error"
                })
            }
        } else {
            res.json({
                status: "error",
                data: "You are not authorized to access this endpoint"
            })
        }
    })
    .post('/devices/create', (req, res) => {
        var local_token = check_jwt(req.headers.token);
        if (local_token.group == "admin") {
            var create_query = "INSERT INTO device (uuid, ip, mac, ports, risk_level, services) VALUES (?, ?, ?, ?, ? , ?);"
            try {
                connection.query(create_query, [req.body.uuid, req.body.ip, req.body.mac, req.body.manufacturer, req.body.ports, req.body.risk_level, req.body.services, req.body.name, req.body.modell], function(error, results, fields) {
                    if (error) {
                        throw error;
                        res.status(500).send("An error occured: " + error);
                    } else {
                        res.status(200).send("The devices was added.")
                    }
                });
            } catch (e) {
                res.status(500).send("The device already exists.")
            }
        } else {
            res.json({
                status: "error",
                data: "You are not authorized to access this endpoint"
            })
        }
    })
    .post('/devices/remove', (req, res) => {
        var local_token = check_jwt(req.headers.token);
        if (local_token.group == "admin") {
            var create_query = "DELETE FROM device WHERE uuid = ?;"
            try {
                connection.query(create_query, [req.body.uuid], function(error, results, fields) {
                    if (error) {
                        throw error;
                        res.status(500).send("An error occured: " + error);
                    } else {
                        res.status(200).send("The devices was removed.")
                    }
                });
            } catch (e) {
                res.status(500).send("The device does not exist.")
            }
        } else {
            res.json({
                status: "error",
                data: "You are not authorized to access this endpoint"
            })
        }
    })
    // Expects {"token": "$2a$10$9B3aQ.iG8ekCH34yiIt9k.8D.EdMDIyMYenQRYr.sMsyzyA0B38p.","new": {"name": "testuser","password": "testpassword", "group": "group", "mail": "mail"}}
    .post('/users/create', (req, res) => {
        var local_token = check_jwt(req.headers.token);
        if (local_token.group == "admin") {
            // Create password hash
            var hash = bcrypt.hashSync(req.body.new.password, 10);
            try {
                // Create new user
                var create_query = "INSERT INTO user (username, `hash`, `group`, mail) VALUES (?, ?, ?, ?);"
                connection.query(create_query, [req.body.new.name, hash, req.body.new.group, req.body.new.mail], function(error, results, fields) {
                    if (error) {
                        throw error;
                        res.json({
                            status: "error",
                            data: e
                        })
                    } else {
                        res.json({
                            status: "ok",
                            data: "The user was created."
                        })
                    }
                });
            } catch (e) {
                res.json({
                    status: "error",
                    data: "This user seems to already exist."
                })
            }

        } else {
            res.json({
                status: "error",
                data: "You are not authorized to access this endpoint"
            })
        }
    })
    .get('/debug/reset', (req, res) => {

        var hash = bcrypt.hashSync("admin", 10);
        var name = "admin";
        console.log(hash);

        var query = "INSERT INTO user (name, hash) VALUES (" + name + ", " + hash + ");"
        connection.query(query, function(error, results, fields) {
            if (error) throw error;
        });


        res.send("User admin with password 'admin' was added to the database.");
    })

module.exports = api
