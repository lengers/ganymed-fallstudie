const express = require('express')
const api = express.Router()

const fs = require('fs')
const path = require('path')
const request = require('request')
const uuid = require('uuid')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const secret = 'goodenoughforthedemo'

const HashMap = require('hashmap')
const nodemailer = require('nodemailer')

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  auth: {
    user: 'noreply.ganymed@gmail.com',
    pass: 'aenue8Phieyoh3Xahgh5niaGh7ofo3ei'
  }
})

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

const notifyUser = (userMail, about, body) => {
  if (userMail !== null) {
    let mailOptions = {
      from: '"Ganymed" <noreply.ganymed@gmail.com>',
      to: userMail,
      subject: about,
      html: body
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      }
      console.log('Message %s sent: %s', info.messageId, info.response)
    })
  } else {
    console.log('ERR: No mail given, cannot send mail. Duh.')
  }
}

const notifyRisklevel = (riskLevel, username) => {
  const getUsersQuery = 'SELECT * FROM user;'
  connection.query(getUsersQuery, (error, results, fields) => {
    if (error) throw error
    for (var i = 0; i < results.length; i++) {
      if ((results[i].settings !== null) && (results[i].settings.mail_risk !== null) && (results[i].settings.risklevel !== null)) {
        let settings = JSON.parse(results[i].settings)
        let mail = results[i].mail
        let username = results[i].username
        if (riskLevel >= settings.risklevel) {
          const bodyPath = path.join(__dirname, '..', '..', 'public', 'assets', 'mailbodies', 'risk.html')
          fs.readFile(bodyPath, (err, rawMailBody) => {
            if (err) throw err
            let mailBody = rawMailBody.toString().replace('{username}', username).replace('{Risikolevel}', riskLevel)
            notifyUser(mail, 'Ganymed: Sicherheitsrisko', mailBody)
          })
        }
      }
    }
  })
}

const notifyLoginTries = (username) => {
  const getUsersQuery = 'SELECT * FROM user WHERE username = ?;'
  connection.query(getUsersQuery, [username], (error, results, fields) => {
    if (error) throw error
    if ((results[0].mail !== null) && (Boolean(results[0].notification_on) === true)) {
      let mail = results[0].mail
      let username = results[0].username
      const bodyPath = path.join(__dirname, '..', '..', 'public', 'assets', 'mailbodies', 'login.html')
      fs.readFile(bodyPath, (err, rawMailBody) => {
        if (err) throw err
        let mailBody = rawMailBody.toString().replace('{username}', username)
        notifyUser(mail, 'Ganymed: Wiederholte Loginversuche', mailBody)
      })
    }
  })
}

let loginHashmap = new HashMap()

// Mocking scans requires these constiables
let scanUuid = ''
let scanStart = ''
let scanStartISO = ''
let scanPercent = 0

api
    .get('/help', (req, res) => {
      res.status(418).json({
        status: "I'm a teapot."
      })
    })
    .post('/auth', (req, res) => {
      connection.query('SELECT * FROM user WHERE username = ?', [req.body.name], (error, results, fields) => {
        if (error) {
          throw error
        }
        const passwordCorrect = bcrypt.compareSync(req.body.password, results[0].hash)
        if (passwordCorrect) {
          loginHashmap.set(req.body.name, 0)
          const userToken = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 13),
            name: req.body.name,
            group: results[0].group
          }, secret)
          console.log('TOKEN CREATED')
          res.status(200).json({
            type: true,
            data: req.body.name,
            token: userToken
          })
        } else {
          if (loginHashmap.has(req.body.name)) {
            let loginCount = loginHashmap.get(req.body.name)
            console.log(req.body.name + ': ' + loginCount)
            loginHashmap.set(req.body.name, loginCount + 1)
            if ((loginCount >= 4) && (Boolean(results[0].notification_on) === true)) {
              console.log('Sending mail')
              notifyLoginTries(req.body.name)
              loginHashmap.set(req.body.name, 0)
            }
          } else {
            loginHashmap.set(req.body.name, 1)
          }
          // TODO: Implement Sendmail option
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
    .post('/devices/:uuid', checkJwt, (req, res) => {
      const createQuery = 'INSERT INTO device (uuid, ip, mac, manufacturer, ports, risk_level, services, name, modell) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);'
      try {
        connection.query(createQuery, [req.params.uuid, req.body.ip, req.body.mac, req.body.manufacturer, req.body.ports, req.body.risk_level, req.body.services, req.body.name, req.body.modell], (error, results, fields) => {
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
    .put('/devices/:uuid', checkJwt, (req, res) => {
      const createQuery = 'UPDATE device SET uuid = ?, ip = ?, mac = ?, manufacturer = ?, ports = ?, risk_level = ?, services = ?, name = ?, modell = ? WHERE uuid = ?;'
      try {
        connection.query(createQuery, [req.params.uuid, req.body.ip, req.body.mac, req.body.manufacturer, req.body.ports, req.body.risk_level, req.body.services, req.body.name, req.body.modell, req.params.uuid], (error, results, fields) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              error: error
            })
            throw error
          } else {
            res.status(200).json({
              status: 'ok',
              data: 'The device was updated.'
            })
          }
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          error: 'The device does not exist.'
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
    // Expects {"password": "password", "group": "group", "settings: "JSON", "mail": "mail", "notification_on": BOOLEAN}
    .post('/users/:username', checkJwtAdmin, (req, res) => {
      console.log(req.body)
        // Create password hash

      const getUsersQuery = 'SELECT * FROM user;'
      connection.query(getUsersQuery, (error, results, fields) => {
        if (error) throw error
        if (results.length >= 4) {
          res.status(406).json({
            status: 'error',
            data: 'Your reached the maximum of users.'
          })
        } else {
          const hash = bcrypt.hashSync(req.body.password, 10)

          try {
                    // Create new user
            const createQuery = 'INSERT INTO user (username, `hash`, `group`, settings, mail, notification_on) VALUES (?, ?, ?, ?, ?, ?);'
            connection.query(createQuery, [req.params.username, hash, req.body.group, JSON.stringify(req.body.settings), req.body.mail, req.body.notification_on], (error, results, fields) => {
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
        }
      })
    })
    .put('/users/:username', checkJwt, (req, res) => {
      console.log(req.body)
      var createQuery = ''
      var params = []
      var hash = ''
      console.log(req.headers.decoded)
      if ((req.params.username === req.headers.decoded.name) || (req.headers.decoded.group === 'admin')) {
        if ((req.body.password === '') || (req.body.password === null) || (req.body.password === null)) {
          createQuery = 'UPDATE user SET username = ?, `group` = ?, settings = ?, mail = ?, notification_on = ? WHERE username = ?;'
          params = [req.body.username, req.body.group, JSON.stringify(req.body.settings), req.body.mail, req.body.notification_on, req.params.username]
        } else {
          // Create password hash
          hash = bcrypt.hashSync(req.body.password, 10)
          createQuery = 'UPDATE user SET username = ?, `hash` = ?, `group` = ?, settings = ?, mail = ?, notification_on = ? WHERE username = ?;'
          params = [req.body.username, hash, req.body.group, JSON.stringify(req.body.settings), req.body.mail, req.body.notification_on, req.params.username]
        }
        try {
            // Update user
          connection.query(createQuery, params, (error, results, fields) => {
            if (error) {
              res.status(500).json({
                status: 'error',
                data: error
              })
              throw error
            } else {
              res.status(200).json({
                status: 'ok',
                data: 'The user was updated.'
              })
            }
          })
        } catch (e) {
          res.status(500).json({
            status: 'error',
            data: 'This user seems to already exist.'
          })
        }
      } else {
        res.status(401).json({
          status: 'error',
          data: 'You are not authorized to do this.'
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
    .get('/users', checkJwt, (req, res) => {
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
    .get('/users/:username', checkJwt, (req, res) => {
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
    .get('/groups', checkJwtAdmin, (req, res) => {
      try {
        const createQuery = 'SELECT * FROM `group`;'
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
          data: 'No such group.'
        })
      }
    })
    .get('/scan', checkJwt, (req, res) => {
      let answerdata = {
        running: null,
        previous: null
      }

      try {
        const createQuery = 'SELECT * FROM scan ORDER BY start_time DESC;'
        connection.query(createQuery, (error, results, fields) => {
          if (error) {
            throw error
          }
          console.log(results)
          answerdata.previous = results
          res.status(200).json({
            status: 'ok',
            data: answerdata
          })
        })
      } catch (e) {
        res.status(500).json({
          status: 'error',
          data: 'Something went wrong connecting to the database.'
        })
      }
    })
    /* =========================================================== scan ===========================================================
     *
     *
     */
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
        let dateNow = Date.now()
        scanStart = Math.floor(dateNow / 1000)
        scanStartISO = new Date(dateNow).toISOString().slice(0, 19).replace('T', ' ')
        res.status(200).json({
          status: 'ok',
          data: 'A scan has been created.',
          uuid: scanUuid
        })
      }
    })
    .get('/scan/status/:uuid', checkJwt, (req, res) => {
        // If a scan is already running, tell the user so
      console.log(req.params.uuid)
      if (scanUuid !== req.params.uuid) {
        res.status(424).json({
          status: 'error',
          data: 'No scan with matching UUID found.'
        })
      } else {
        const timestamp = Math.floor(Date.now() / 1000)
        scanPercent = Math.floor((timestamp - scanStart) / 10 * 100)
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
        // let scanUser = req.headers.decoded.name

      if (scanUuid === req.params.uuid) {
        console.log(req.params.uuid)
        if (scanPercent < 100) {
          res.status(423).json({
            status: 'error',
            data: 'The specified scan is not yet finished.'
          })
        } else {
          // Write scan info to DB
          try {
              // get forged scan results
            request.get('http://localhost:7777/scanforge', function (error, response, body) {
              if (error) throw error
              let scanResult = JSON.parse(body).data
              console.log(JSON.parse(body).data)
              notifyRisklevel(scanResult.overallRisk)

              const resultFilePath = path.join(__dirname, '..', '..', 'public', 'assets', 'mock', scanUuid + '.json')
              fs.writeFile(resultFilePath, JSON.stringify(JSON.parse(body).data), (err) => {
                if (err) throw err
              })

              const createQuery = 'INSERT INTO scan (scan_no, start_time, started_by_user, duration, risk_level) VALUES (?, ?, ?, ?, ?);'
              connection.query(createQuery, [scanUuid, scanStartISO, req.headers.decoded.name, 120, scanResult.overallRisk], (error, results, fields) => {
                if (error) throw error
                res.status(200).json({
                  status: 'ok',
                  data: {
                    uuid: req.params.uuid,
                    results: JSON.parse(body).data
                  }
                })
                scanUuid = ''
              })
            })
          } catch (e) {
            console.log(e)
            res.status(500).json({
              status: 'error',
              data: 'Something went wrong connecting to the database.'
            })
          }
        }
      } else {
        try {
          const createQuery = 'SELECT * FROM scan WHERE scan_no = ?;'
          connection.query(createQuery, [req.params.uuid], (error, results, fields) => {
            if (error) {
              throw error
            }
            if (results.length > 0) {
              const scanpath = path.join(__dirname, '..', '..', 'public', 'assets', 'mock', req.params.uuid + '.json')
              fs.readFile(scanpath, (err, scanresults) => {
                if (err) throw err
                          // Send answer
                res.status(200).json({
                  status: 'ok',
                  data: {
                    uuid: req.params.uuid,
                    results: JSON.parse(scanresults)
                  }
                })
              })
            } else {
              res.status(424).json({
                status: 'error',
                data: 'No scan with matching UUID found.'
              })
            }
          })
        } catch (e) {
          res.status(424).json({
            status: 'error',
            data: 'No scan with matching UUID found.'
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
          console.log(queryArray)
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
