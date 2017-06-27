const express = require('express')
const api = express.Router()

const fs = require('fs')
const path = require('path')

const uuid = require('uuid')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const secret = 'goodenoughforthedemo'

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysqlpass',
  database: 'Ganymed'
})

const checkJwt = (req, res, next) => {
  jwt.verify(req.headers.token, secret, (err, decoded) => {
    if (err) {
      res.status(401).json({
        status: 'error',
        data: 'You are not authorized to access this endpoint'
      })
    } else {
      req.headers.decoded = decoded
      next()
    }
  })
}

const checkJwtAdmin = (req, res, next) => {
  jwt.verify(req.headers.token, secret, (err, decoded) => {
    if (err || decoded.group !== 'admin') {
      res.status(401).json({
        status: 'error',
        data: 'You are not authorized to access this endpoint'
      })
    } else {
      next()
    }
  })
}

// Mocking scans requires these constiables
let scanUuid = ''
let scanStart = ''
let scanPercent = 0

api
    .get('/help', (req, res) => {
      res.status(418).json({
        status: "I'm a teapot."
      })
    })
    .post('/auth', (req, res) => {
      connection.query('SELECT * FROM user WHERE username = ?', [req.body.name], (error, results, fields) => {
        if (error) throw error
        const passwordCorrect = bcrypt.compareSync(req.body.password, results[0].hash)
        if (passwordCorrect) {
                // TODO: Implement groups like:
                //   const userToken = jwt.sign({user: req.params.name, group: TODO}, secret);
          const userToken = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 13),
            name: req.body.name,
            group: results[0].group
          }, secret)
          res.status(200).json({
            type: true,
            data: req.body.name,
            token: userToken
          })
        } else {
          res.status(403).json({
            type: false,
            data: req.body.name,
            token: null
          })
        }
      })
    })
    .get('/auth/check', (req, res) => {
      jwt.verify(req.headers.token, secret, (err, decoded) => {
        if (err) {
          console.log('Token invalid.')
          res.status(200).json({
            status: 'invalid'
          })
        } else {
          console.log('DEBUG: ' + decoded)
          res.status(200).json({
            status: 'ok',
            data: decoded
          })
        }
      })
    })
    .get('/devices', checkJwt, (req, res) => {
      try {
        connection.query('SELECT * FROM device;', (error, results, fields) => {
          if (error) throw error
          res.status(200).json({
            status: 'ok',
            data: results
          })
        })
      } catch (e) {
        res.status(500).json({
          status: 'error'
        })
      }
    })
    .get('/devices/:uuid', checkJwt, (req, res) => {
      try {
        connection.query('SELECT * FROM device WHERE uuid = ?;', req.params.uuid, (error, results, fields) => {
          if (error) throw error
          res.status(200).json({
            status: 'ok',
            data: results
          })
        })
      } catch (e) {
        res.status(500).json({
          status: 'error'
        })
      }
    })
    .post('/devices', checkJwt, (req, res) => {
      const createQuery = 'INSERT INTO device (uuid, ip, mac, ports, risk_level, services) VALUES (?, ?, ?, ?, ? , ?);'
      try {
        connection.query(createQuery, [req.body.uuid, req.body.ip, req.body.mac, req.body.manufacturer, req.body.ports, req.body.risk_level, req.body.services, req.body.name, req.body.modell], (error, results, fields) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              error: error
            })
            throw error
          } else {
            res.status(200).json({
              status: 'ok',
              data: 'The device was added.'
            })
          }
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          error: 'The device already exists.'
        })
      }
    })
    .delete('/devices/:uuid', checkJwt, (req, res) => {
      const createQuery = 'DELETE FROM device WHERE uuid = ?;'
      try {
        connection.query(createQuery, [req.params.uuid], (error, results, fields) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              error: error
            })
            throw error
          } else {
            res.status(200).json({
              status: 'ok',
              data: 'The device was removed.'
            })
          }
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          error: 'The device does not exist.'
        })
      };
    })
    // Expects {"token": "$2a$10$9B3aQ.iG8ekCH34yiIt9k.8D.EdMDIyMYenQRYr.sMsyzyA0B38p.","new": {"name": "testuser","password": "testpassword", "group": "group", "mail": "mail"}}
    .post('/users', checkJwtAdmin, (req, res) => {
        // Create password hash
      const hash = bcrypt.hashSync(req.body.new.password, 10)
      try {
            // Create new user
        const createQuery = 'INSERT INTO user (username, `hash`, `group`, mail) VALUES (?, ?, ?, ?);'
        connection.query(createQuery, [req.body.new.name, hash, req.body.new.group, req.body.new.mail], (error, results, fields) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              data: error
            })
            throw error
          } else {
            res.status(200).json({
              status: 'ok',
              data: 'The user was created.'
            })
          }
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          data: 'This user seems to already exist.'
        })
      }
    })
    .delete('/users/:username', checkJwtAdmin, (req, res) => {
      try {
        const createQuery = 'DELETE FROM user WHERE username = ?;'
        connection.query(createQuery, [req.params.username], (error, results, fields) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              data: error
            })
            throw error
          } else {
            res.status(200).json({
              status: 'ok',
              data: 'The user was deleted.'
            })
          }
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          data: 'No such user.'
        })
      }
    })
    .get('/users', checkJwtAdmin, (req, res) => {
      try {
        const createQuery = 'SELECT * FROM user;'
        connection.query(createQuery, (error, results, fields) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              data: error
            })
            throw error
          } else {
            res.status(200).json({
              status: 'ok',
              data: results
            })
          }
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          data: 'No such user.'
        })
      }
    })
    .get('/users/:username', checkJwtAdmin, (req, res) => {
      try {
        const createQuery = 'SELECT * FROM user WHERE username = ?;'
        connection.query(createQuery, [req.params.username], (error, results, fields) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              data: error
            })
            throw error
          } else {
            res.status(200).json({
              status: 'ok',
              data: results
            })
          }
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          data: 'No such user.'
        })
      }
    })
    .get('/scan/start', checkJwt, (req, res) => {
        // If a scan is already running, tell the user so
      console.log(req.headers.decoded)
      if (scanUuid !== '') {
        res.status(424).json({
          status: 'error',
          data: 'A scan is already running.'
        })
      } else {
        scanUuid = uuid.v4()
        scanStart = Math.floor(Date.now() / 1000)
        res.status(200).json({
          status: 'ok',
          data: 'A scan has been created.',
          uuid: scanUuid
        })
      }
    })
    .get('/scan/status/:uuid', checkJwt, (req, res) => {
        // If a scan is already running, tell the user so
      if (scanUuid !== req.params.uuid) {
        res.status(424).json({
          status: 'error',
          data: 'No scan with matching UUID found.'
        })
      } else {
        const timestamp = Math.floor(Date.now() / 1000)
        scanPercent = Math.floor((timestamp - scanStart) / 120 * 100)
        if (scanPercent > 100) {
          scanPercent = 100
        }
        res.status(200).json({
          status: 'ok',
          data: {
            uuid: scanUuid,
            started: scanStart,
            completion: scanPercent
          }
        })
      }
    })
    .get('/scan/results/:uuid', checkJwt, (req, res) => {
        // If a scan is already running, tell the user so
      if (scanUuid !== req.params.uuid) {
        res.status(424).json({
          status: 'error',
          data: 'No scan with matching UUID found.'
        })
      } else {
        if (scanPercent < 100) {
          res.status(423).json({
            status: 'error',
            data: 'The specified scan is not yet finished.'
          })
        } else {
                // Write scan info to DB
          try {
                    // Create new user
            const createQuery = 'INSERT INTO scan (scan_no, start_time, started_by_user, duration, risk_level) VALUES (?, ?, ?, ?, ?);'
            connection.query(createQuery, [scanUuid, scanStart, req.headers.decoded.name, 120, 2], (error, results, fields) => {
              if (error) {
                throw error
              }
            })
          } catch (e) {
            res.status(500).json({
              status: 'error',
              data: 'Something went wrong connecting to the database.'
            })
          }
                // Read scan results from file
          const scanpath = path.join(__dirname, '..', '..', 'public', 'assets', 'mock', 'scan.json')
          fs.readFile(scanpath, (err, scanresults) => {
            if (err) throw err
                    // Send answer
            res.status(200).json({
              status: 'ok',
              data: JSON.parse(scanresults)
            })
          })
        }
      }
    })
    .get('/debug/reset', (req, res) => {
      const sqlpath = path.join(__dirname, '..', '..', 'ganymed.sql')
      fs.readFile(sqlpath, (err, sqlquery) => {
        if (err) throw err
            // Replace all emtpy elements in array
        const query = sqlquery.toString().replace(/(?:\r\n|\r|\n)/g, ' ')
        const queryArray = query.split(';').filter(function (e) {
          return /\S/.test(e)
        })
        try {
          for (var i = 0; i < queryArray.length; i++) {
            console.log('EXECUTING QUERY: ' + queryArray[i])
            connection.query(queryArray[i] + ';', (error, results, fields) => {
              if (error) throw error
            })
          };
          res.status(200).json({
            status: 'ok',
            data: "The database has been reset and filled with demo data. The default user ist 'admin' with the password 'admin'"
          })
        } catch (e) {
          res.status(500).json({
            status: 'error',
            data: 'Something went wrong. You may have to recreate the database yourself.',
            error: e
          })
        }
      })
    })

module.exports = api
