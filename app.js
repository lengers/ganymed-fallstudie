/* -------------------------app.js------------------------------------
 *
 * app.js is the script first  to be executed.
 * In this file the specific routes are read and the webserver is started.
 *
 * ------------------------------------------------------------------- */


const config = require('./components/config/express.json')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs')

/* -------------------------Express Config------------------------- */
app
    .use(bodyParser.urlencoded({
      'extended': true
    }))
    .use(bodyParser.json())
    .use('/', express.static('./public'))
    .use('/node_modules', express.static('./node_modules'))

/* -------------------------Route Definitions------------------------- */
fs
    .readdirSync('./components/routes')
    .forEach(file => {
      app.use('/' + file.replace('.js', ''), require('./components/routes/' + file))
    })

let port = process.env.PORT || config.port || 80
app.listen(port)
console.log('Please open your favorite browser and go to ' + 'localhost:' + port)
