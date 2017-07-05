const express = require('express')
const scanforge = express.Router()

const HashMap = require('hashmap')

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysqlpass',
  database: 'Ganymed'
})

scanforge
.get('/', (req, res) => {
  let portMap = new HashMap().set('22', 'ssh').set('23', 'telnet').set('80', 'http').set('443', 'https').set('161', 'snmp').set('8080', 'http')
  // hashmaps only work in one direction
  let serviceMap = new HashMap().set('ssh', '22').set('telnet', '23').set('http', '80').set('https', '443').set('snmp', '161').set('http', '8080')
  let devicePortMap = new HashMap()
  let deviceRiskMap = new HashMap()
  let deviceVulnMap = new HashMap()
    // For scan result generation, possible services
    // For scan result generation, possible vulnerabilities
  let vulns = ['firmware', 'traffic', 'traffic', 'traffic']
  let vulnIssues = ['outdated', 'malicious', 'badhost', 'suspicious']
  let vulnSolution = ['update', 'disconnect', 'disconnect', 'disconnect']
  let vulnLink = ['https://somedomain.com/update', 'https://avm.de/service/fritzbox/fritzbox-7390/wissensdatenbank/publication/show/894_Automatische-Portfreigaben-einrichten/', 'https://avm.de/service/fritzbox/fritzbox-7390/wissensdatenbank/publication/show/894_Automatische-Portfreigaben-einrichten/', 'https://avm.de/service/fritzbox/fritzbox-7390/wissensdatenbank/publication/show/894_Automatische-Portfreigaben-einrichten/']

  let riskSum = 0

  let scan = {
    'devices': [],
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

  const createQuery = 'SELECT * FROM device;'
  try {
    connection.query(createQuery, (error, results, fields) => {
      if (error) throw error
      for (var i = 0; i < results.length; i++) {
        let device = {}
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
          console.log(ports[j] + '     ' + portMap.get(ports[j]))
          device.openPorts[j].service = portMap.get(ports[j])
        }
        device.services = {}
        device.services.services = results[i].services
        let services = results[i].services.split(', ')
        let servicesPorts = []
        for (var k = 0; k < services.length; k++) {
          servicesPorts[k] = serviceMap.get(services[k])
        }
        device.services.ports = servicesPorts.join(', ')

        device.vulnerabilities = []
        let vulnCount = Math.random()
        for (var l = 0; l < vulnCount; l++) {
          let vulnId = Math.floor(Math.random() * vulns.length)
          device.vulnerabilities[l] = {}
          device.vulnerabilities[l].type = vulns[vulnId]
          device.vulnerabilities[l].issue = vulnIssues[vulnId]
          device.vulnerabilities[l].service = device.services.services
          device.vulnerabilities[l].solution = vulnSolution[vulnId]
          device.vulnerabilities[l].link = vulnLink[vulnId]
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
        if (device.vulnerabilities.length > 0) {
          device.risk = Math.floor(Math.random() * (10 - 3) + 3)
        } else {
          device.risk = Math.floor(Math.random() * (4 - 1) + 1)
        }
        device.catergory = 'device'

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

module.exports = scanforge
