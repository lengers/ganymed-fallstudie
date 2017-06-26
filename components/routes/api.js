const express = require('express')
const api = express.Router()

const fs = require('fs')
const path = require('path');

const uuid = require('uuid');

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secret = "goodenoughforthedemo";

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysqlpass',
    database: 'Ganymed'
});

const bodyParser = require('body-parser')
api.use(bodyParser.json()); // to support JSON-encoded bodies
api.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// const check_jwt = (next, token) => {
//     jwt.verify(token, secret, (err, decoded) => {
//         if (err) {
//             console.log(err);
//             return "invalid";
//         } else {
//             console.log(decoded);
//             return decoded;
//         }
//     });
// }


// Mocking scans requires these constiables
let scan_uuid = "";
let scan_start = "";
let scan_percent = 0;

api
    .get('/help', (req, res) => {
        res.status(418).json({
            status: "I'm a teapot."
        })
    })
    .post('/auth', (req, res) => {
        connection.query('SELECT * FROM user WHERE username = ?', [req.body.name], (error, results, fields) => {
            if (error) throw error;
            const hash = results[0].hash;
            const password_correct = bcrypt.compareSync(req.body.password, results[0].hash);
            if (password_correct) {
                // TODO: Implement groups like:
                //   const user_token = jwt.sign({user: req.params.name, group: TODO}, secret);
                const user_token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 13),
                    name: req.body.name,
                    group: results[0].group
                }, secret);
                res.status(200).json({
                    type: true,
                    data: req.body.name,
                    token: user_token
                });
            } else {
                res.status(403).json({
                    type: false,
                    data: req.body.name,
                    token: null
                });
            }
        });
    })
    .get('/auth/check', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if (err) {
                console.log("Token invalid.");
                res.status(200).json({
                    status: "invalid"
                })
            } else {
                console.log("DEBUG: " + decoded);
                res.status(200).json({
                    status: "ok",
                    data: decoded
                })
            }
        });
    })
    .get('/devices', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: "error",
                    data: "You are not authorized to access this endpoint"
                })
            } else {
                try {
                    connection.query('SELECT * FROM device;', (error, results, fields) => {
                        if (error) throw error;
                        res.status(200).json({
                            status: "ok",
                            data: results
                        });
                    });
                } catch (e) {
                    res.status(500).json({
                        status: "error"
                    })
                }
            }
        });
    })
    .post('/devices/create', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: "error",
                    data: "You are not authorized to access this endpoint"
                })
            } else {
                const create_query = "INSERT INTO device (uuid, ip, mac, ports, risk_level, services) VALUES (?, ?, ?, ?, ? , ?);"
                try {
                    connection.query(create_query, [req.body.uuid, req.body.ip, req.body.mac, req.body.manufacturer, req.body.ports, req.body.risk_level, req.body.services, req.body.name, req.body.modell], (error, results, fields) => {
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
            }
        });
    })
    .post('/devices/remove', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: "error",
                    data: "You are not authorized to access this endpoint"
                })
            } else {
                const create_query = "DELETE FROM device WHERE uuid = ?;"
                try {
                    connection.query(create_query, [req.body.uuid], (error, results, fields) => {
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
            }
        });
    })
    // Expects {"token": "$2a$10$9B3aQ.iG8ekCH34yiIt9k.8D.EdMDIyMYenQRYr.sMsyzyA0B38p.","new": {"name": "testuser","password": "testpassword", "group": "group", "mail": "mail"}}
    .post('/users/create', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if ((err) || (decoded.group !== "admin")) {
                res.status(403).json({
                    status: "error",
                    data: "You are not authorized to access this endpoint"
                })
            } else {
                // Create password hash
                const hash = bcrypt.hashSync(req.body.new.password, 10);
                try {
                    // Create new user
                    const create_query = "INSERT INTO user (username, `hash`, `group`, mail) VALUES (?, ?, ?, ?);"
                    connection.query(create_query, [req.body.new.name, hash, req.body.new.group, req.body.new.mail], (error, results, fields) => {
                        if (error) {
                            throw error;
                            res.status(500).json({
                                status: "error",
                                data: e
                            })
                        } else {
                            res.status(200).json({
                                status: "ok",
                                data: "The user was created."
                            })
                        }
                    });
                } catch (e) {
                    res.status(500).json({
                        status: "error",
                        data: "This user seems to already exist."
                    })
                }
            }
        });
    })
    .get('/scan/start', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: "error",
                    data: "You are not authorized to access this endpoint"
                })
            } else {
                // If a scan is already running, tell the user so
                if (scan_uuid != "") {
                    res.status(424).json({
                        status: "error",
                        data: "A scan is already running."
                    })
                } else {
                    scan_uuid = uuid.v4();
                    scan_start = Math.floor(Date.now() / 1000);
                    res.status(200).json({
                        status: "ok",
                        data: "A scan has been created.",
                        uuid: scan_uuid
                    })
                }
            }
        });
    })
    .get('/scan/status/:uuid', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: "error",
                    data: "You are not authorized to access this endpoint"
                })
            } else {
                // If a scan is already running, tell the user so
                if (scan_uuid != req.params.uuid) {
                    res.status(424).json({
                        status: "error",
                        data: "No scan with matching UUID found."
                    })
                } else {
                    const timestamp = Math.floor(Date.now() / 1000);
                    scan_percent = Math.floor((timestamp - scan_start) / 120 * 100);
                    if (scan_percent > 100) {
                        scan_percent = 100
                    }

                    res.status(200).json({
                        status: "ok",
                        data: {
                            uuid: scan_uuid,
                            started: scan_start,
                            completion: scan_percent
                        }
                    })
                }
            }
        });
    })
    .get('/scan/results/:uuid', (req, res) => {
        jwt.verify(req.headers.token, secret, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    status: "error",
                    data: "You are not authorized to access this endpoint"
                })
            } else {
                // If a scan is already running, tell the user so
                if (scan_uuid != req.params.uuid) {
                    res.status(424).json({
                        status: "error",
                        data: "No scan with matching UUID found."
                    })
                } else {
                    if (scan_percent < 100) {
                        res.status(423).json({
                            status: "error",
                            data: "The specified scan is not yet finished."
                        })
                    } else {
                        // Write scan info to DB
                        try {
                            // Create new user
                            const create_query = "INSERT INTO scan (scan_no, start_time, started_by_user, duration, risk_level) VALUES (?, ?, ?, ?, ?);"
                            connection.query(create_query, [scan_uuid, scan_start, decoded.name, 120, 2], (error, results, fields) => {
                                if (error) {throw error}
                            });
                        } catch (e) {
                            res.status(500).json({
                                status: "error",
                                data: "Something went wrong connecting to the database."
                            })
                        }
                        // Read scan results from file
                        const scanpath = path.join(__dirname, '..', '..', 'public', 'assets', 'mock', 'scan.json');
                        fs.readFile(scanpath, (err, scanresults) => {
                            if (err) throw err;
                            // Send answer
                            res.status(200).json({
                                status: "ok",
                                data: JSON.parse(scanresults)
                            })
                        });
                    }
                }
            }
        });
    })
    .get('/debug/reset', (req, res) => {
        const sqlpath = path.join(__dirname, '..', '..', 'ganymed.sql');
        fs.readFile(sqlpath, (err, sqlquery) => {
            if (err) throw err;
            // Replace all emtpy elements in array
            const query = sqlquery.toString().replace(/(?:\r\n|\r|\n)/g, ' ');
            const query_array = query.split(";").filter(function(e){return /\S/.test(e)});
            try {
                for (const i = 0; i < query_array.length; i++) {
                    console.log("EXECUTING QUERY: " + query_array[i]);
                    connection.query(query_array[i] + ";", (error, results, fields) => {
                            if (error) throw error;
                        });
                };
                res.status(200).json({
                    status: "ok",
                    data: "The database has been reset and filled with demo data. The default user ist 'admin' with the password 'admin'"
                });
            } catch (e) {
                res.status(500).json({
                    status: "error",
                    data: "Something went wrong. You may have to recreate the database yourself.",
                    error: e
                });
            }
        });
    })

module.exports = api
