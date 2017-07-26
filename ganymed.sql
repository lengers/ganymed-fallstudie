DROP SCHEMA IF EXISTS Ganymed;
CREATE SCHEMA Ganymed;
USE Ganymed;

CREATE TABLE `group` (
    group_id VARCHAR(10) PRIMARY KEY,
    alter_device_list BOOLEAN NOT NULL,
    run_scan BOOLEAN NOT NULL,
    create_user BOOLEAN NOT NULL,
    change_group BOOLEAN NOT NULL
);
CREATE TABLE `user` (
    username VARCHAR(30) PRIMARY KEY,
    `hash` VARCHAR(200) NOT NULL,
    `group` VARCHAR(12) NOT NULL REFERENCES `group` (`group_id`),
    settings VARCHAR(500),
    mail VARCHAR(50),
    notification_on BOOLEAN
);
CREATE TABLE scan (
    scan_no VARCHAR(50) PRIMARY KEY,
    start_time DATETIME NOT NULL,
    started_by_user VARCHAR(30) NOT NULL REFERENCES `user` (username),
    duration INT NOT NULL,
    risk_level INT NOT NULL
);
CREATE TABLE ganymed (
    serial_no INT PRIMARY KEY,
    firmware VARCHAR(30) NOT NULL,
    scan_running BOOLEAN NOT NULL,
    scheduled_scan DATETIME NOT NULL,
    license_mail VARCHAR(30) NOT NULL UNIQUE,
    license_key VARCHAR(30) NOT NULL UNIQUE
);
CREATE TABLE device (
    uuid VARCHAR(50) PRIMARY KEY,
    ip VARCHAR(128) NOT NULL,
    mac VARCHAR(64) NOT NULL,
    manufacturer VARCHAR(50),
    ports VARCHAR(20) NOT NULL,
    risk_level INT NOT NULL,
    services VARCHAR(50) NOT NULL,
    name VARCHAR(50),
    modell VARCHAR(50)
);

INSERT INTO `group`(Group_id, alter_device_list, run_scan, create_user, change_group) VALUES ('admin', true , true, true, true);
INSERT INTO `group`(Group_id, alter_device_list, run_scan, create_user, change_group) VALUES ('user', true , true, false, false);

INSERT INTO `user` (username, `hash`, `group`, settings, mail, notification_on) VALUES ("admin", "$2a$10$9B3aQ.iG8ekCH34yiIt9k.8D.EdMDIyMYenQRYr.sMsyzyA0B38p.", "admin", '{"mail_risk":true,"risklevel":5}', "thomas85@test.de.com", 1);
INSERT INTO `user` (username, `hash`, `group`) VALUES ("user", "$2a$10$kXUZeHR.yhmTK1AFCfOHJOCp0QO0V4gEEmE2ECsYBTZaN1rPbz1P.", "user");

INSERT INTO device (uuid, ip, mac, ports, risk_level, services, name) VALUES ("4c9a6f10-b862-44a0-89d6-a7e6f7fce535", "10.0.0.100", "E8:90:58:1B:89:9C", "80, 443", 4, "http, https", "IPCam Garage");
INSERT INTO device (uuid, ip, mac, ports, risk_level, services, name) VALUES ("89e75cab-3c34-4153-a3ef-a14b33ecdb45", "10.0.0.72", "B9:7D:7C:5E:97:8E", "23, 8080", 4, "telnet, http", "Feuermelder Erdgeschoss");
INSERT INTO device (uuid, ip, mac, ports, risk_level, services, name) VALUES ("e3116146-5af4-4dee-b455-87e16e050841", "10.0.0.112", "8A:A3:B2:FB:E2:CD", "80, 161", 7, "http, snmp", "Heizkessel");

INSERT INTO scan (scan_no, start_time, started_by_user, duration, risk_level) VALUES ("92b4df72-a823-4e86-a390-3d08f29258f6", "2017-07-05 010:09:29.000", "admin", 120, 5);
