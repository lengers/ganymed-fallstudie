const express = require('express')
const scanforge = express.Router()
const uuid = require('uuid')

const fs = require('fs')
const path = require('path')

const HashMap = require('hashmap')

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysqlpass',
  database: 'Ganymed'
})

/* =========================================================== scanforge ===========================================================
 *  Forges a fake scan that looks realistic to some degree. Used instead of a real scan engine (like nmap or OpenVAS).
 *
 */
scanforge
/* =========================================================== forge scan ===========================================================
 *  Creates a new scan with results for each device.
 *
 */
.get('/', (req, res) => {
  // Map known ports and services
  let portMap = new HashMap().set('22', 'ssh').set('23', 'telnet').set('80', 'http').set('443', 'https').set('161', 'snmp').set('8080', 'http')
  // hashmaps only work in one direction
  let serviceMap = new HashMap().set('ssh', '22').set('telnet', '23').set('http', '80').set('https', '443').set('snmp', '161').set('http', '8080')
  let devicePortMap = new HashMap()
  let deviceRiskMap = new HashMap()
  let deviceVulnMap = new HashMap()

  // get the details for possible vulnerabilities
  const textpath = path.join(__dirname, '..', '..', 'public', 'assets', 'mock', 'vulnTexts.json')
  let vulnTexts = JSON.parse(fs.readFileSync(textpath, 'utf8'))
  console.log(vulnTexts)

  let riskSum = 0

  // scan results skeleton
  let scan = {
    'devices': [],
    'vulnerabilities': [],
    'chartdata': {
      'ports': {
        'ports': [],
        'count': []
      },
      'risks': {
        'risks': [],
        'count': []
      },
      'vulnerabilities': {
        'services': [],
        'count': []
      }
    },
    'overallRisk': null
  }

  // do the following for every device in db
  const createQuery = 'SELECT * FROM device;'
  try {
    connection.query(createQuery, (error, results, fields) => {
      if (error) throw error
      for (var i = 0; i < results.length; i++) {
        let device = {}
        device.uuid = results[i].uuid
        device.hostname = results[i].name
        device.ip = results[i].ip
        device.mac = results[i].mac
        device.openPorts = []
        let ports = results[i].ports.split(', ')
        for (var j = 0; j < ports.length; j++) {
          if (devicePortMap.has(ports[j])) {
            let portCount = devicePortMap.get(ports[j])
            devicePortMap.set(ports[j], portCount + 1)
          } else {
            devicePortMap.set(ports[j], 1)
          }
          device.openPorts[j] = {}
          device.openPorts[j].port = ports[j]
          device.openPorts[j].service = portMap.get(ports[j])
        }
        device.services = {}
        device.services.services = results[i].services
        let services = results[i].services.split(', ')
        let servicesPorts = []
        // get the correct ports for services
        for (var k = 0; k < services.length; k++) {
          servicesPorts[k] = serviceMap.get(services[k])
        }
        device.services.ports = servicesPorts.join(', ')

        let vulnerability = {}
        // flip a coin if the device has a vulnerability
        if (Boolean(Math.floor(Math.random() * 2)) === true) {
          // select a vuln at random
          let vulnId = vulnTexts[Math.floor(Math.random() * vulnTexts.length)]
          console.log('vulnId: ' + vulnId)
          vulnerability.device = device.uuid
          vulnerability.type = vulnId.type
          // throw a dice to determine which service is vulernable
          vulnerability.issue = vulnId.issue.replace('PLACEHOLDER', device.openPorts[Math.floor(Math.random() * device.openPorts.length)].service.toUpperCase())
          vulnerability.solution = vulnId.solution
          vulnerability.actions = vulnId.actions
          scan['vulnerabilities'].push(vulnerability)

          for (var m = 0; m < device.openPorts.length; m++) {
            device.openPorts[m].service
            if (deviceVulnMap.has(device.openPorts[m].service)) {
              let serviceCount = deviceVulnMap.get(device.openPorts[m].service)
              deviceVulnMap.set(device.openPorts[m].service, serviceCount + 1)
            } else {
              deviceVulnMap.set(device.openPorts[m].service, 1)
            }
          }
        }

        device.osNmap = 'Linux'
        // determine risk depending of absence of vulnerability or not
        if (vulnerability !== '{}') {
          device.risk = Math.floor(Math.random() * (10 - 3) + 3)
        } else {
          device.risk = Math.floor(Math.random() * (4 - 1) + 1)
        }
        device.catergory = 'device'

        // calculate risk statistics
        riskSum += device.risk
        if (deviceRiskMap.has(device.risk)) {
          let serviceCount = deviceRiskMap.get(device.risk)
          deviceRiskMap.set(device.risk, serviceCount + 1)
        } else {
          deviceRiskMap.set(device.risk, 1)
        }

        scan.devices[i] = device
      }
      scan.chartdata.ports.ports = devicePortMap.keys()
      scan.chartdata.ports.count = devicePortMap.values()

      for (var dev = 0; i < scan.devices.length; dev++) {

      }
      scan.overallRisk = Math.floor(riskSum / scan.devices.length)

      scan.chartdata.risks.risks = deviceRiskMap.keys()
      scan.chartdata.risks.count = deviceRiskMap.values()

      scan.chartdata.vulnerabilities.services = deviceVulnMap.keys()
      scan.chartdata.vulnerabilities.count = deviceVulnMap.values()

      res.status(200).json({
        status: 'ok',
        data: scan
      })
    })
  } catch (e) {
    res.status(500).json({
      status: 'error'
    })
  }
})
/* =========================================================== fix scan ===========================================================
 *  Takes an existing scan and patches a given vulnerability out of it. Sends back and stores in the db the results as a new scan afterwards.
 *
 */
.get('/fix/:scanId/:deviceId', (req, res) => {
  const scanpath = path.join(__dirname, '..', '..', 'public', 'assets', 'mock', req.params.scanId + '.json')
  fs.readFile(scanpath, (err, rawScan) => {
    if (err) throw err
    let scan = JSON.parse(rawScan.toString())

    let deviceRiskMap = new HashMap()
    for (var i = 0; i < scan.chartdata.risks.risks.length; i++) {
      deviceRiskMap.set(scan.chartdata.risks.risks[i], scan.chartdata.risks.count[i])
    }
    let deviceVulnMap = new HashMap()
    for (var j = 0; j < scan.chartdata.vulnerabilities.services.length; j++) {
      deviceVulnMap.set(scan.chartdata.vulnerabilities.services[j], scan.chartdata.vulnerabilities.count[j])
    }

    let vulnIndex = 0
    scan.vulnerabilities.filter(function (item, index) {
      if (item.device === req.params.deviceId) {
        vulnIndex = index
      }
    })

    let deviceIndex = 0
    scan.devices.filter(function (item, index) {
      if (item.uuid === req.params.deviceId) {
        deviceIndex = index
      }
    })

    let oldRisk = scan.devices[deviceIndex].risk
    deviceRiskMap.set(oldRisk, deviceRiskMap.get(oldRisk) - 1)
    let newRisk = Math.floor(Math.random() * (4 - 1) + 1)
    scan.devices[deviceIndex].risk = newRisk

    const updateQuery = 'UPDATE device SET risk_level = ? WHERE uuid = ?;'
    console.log(req.params.deviceId)
    connection.query(updateQuery, [newRisk, req.params.deviceId], (error, results, fields) => {
      if (error) throw error
    })

    if (deviceRiskMap.has(newRisk)) {
      let riskCount = deviceVulnMap.get(newRisk)
      deviceRiskMap.set(newRisk, riskCount + 1)
    } else {
      deviceRiskMap.set(newRisk, 1)
    }

    for (var k = 0; k < scan.devices[deviceIndex].openPorts.length; k++) {
      let service = scan.devices[deviceIndex].openPorts.service
      deviceVulnMap.set(service, deviceVulnMap.get(service) - 1)
    }

    scan.chartdata.risks.risks = deviceRiskMap.keys()
    scan.chartdata.risks.count = deviceRiskMap.values()

    scan.chartdata.vulnerabilities.services = deviceVulnMap.keys()
    scan.chartdata.vulnerabilities.count = deviceVulnMap.values()

    scan.vulnerabilities.splice(vulnIndex, 1)

    let riskSum = 0
    scan.devices.forEach((item) => {
      riskSum += item.risk
    })
    scan.overallRisk = Math.floor(riskSum / scan.devices.length)

    let scanUuid = uuid.v4()
    let scanStartISO = new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ')

    try {
      const createQuery = 'INSERT INTO scan (scan_no, start_time, started_by_user, duration, risk_level) VALUES (?, ?, ?, ?, ?);'
      connection.query(createQuery, [scanUuid, scanStartISO, 'admin', 120, 4], (error, results, fields) => {
        if (error) {
          throw error
        }

        const resultFilePath = path.join(__dirname, '..', '..', 'public', 'assets', 'mock', scanUuid + '.json')
        fs.writeFile(resultFilePath, JSON.stringify(scan), (err) => {
          if (err) throw err
        })
        res.status(200).json({
          status: 'ok',
          results: scan
        })
      })
    } catch (e) {
      throw e
    }
  })
})

module.exports = scanforge
