const fs = require('fs')
const path = require('path')
const uuid = require('uuid')
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysqlpass',
  database: 'Ganymed'
})

let Scanner = () => {
  let self = this
  this.scanUuid = uuid.v4()
  this.timer = 120000
  this.statusPercent = 0

  status = setInterval((statusPercent) => {
    this.statusPercent += 1
}, this.timer / 100)

  let uuid = () => {
    return this.scanUuid
  }

  let generateScanResults = () => {
    try {
      connection.query('SELECT * FROM device;', (error, results, fields) => {
        if (error) throw error

      })
    } catch (e) {
      console.log(e)
    }
  }

  status(this.statusPercent)
  generateScanResults()
}

exports = Scanner
