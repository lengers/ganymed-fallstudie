CREATE DATABASE  IF NOT EXISTS `Ganymed` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `Ganymed`;
-- MySQL dump 10.13  Distrib 5.7.13, for linux-glibc2.5 (x86_64)
--
-- Host: 127.0.0.1    Database: Ganymed
-- ------------------------------------------------------
-- Server version	5.5.5-10.0.29-MariaDB-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device` (
  `uuid` varchar(50) NOT NULL,
  `ip` varchar(128) NOT NULL,
  `mac` varchar(64) NOT NULL,
  `manufacturer` varchar(50) DEFAULT NULL,
  `ports` varchar(20) NOT NULL,
  `risk_level` int(11) NOT NULL,
  `services` varchar(50) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `modell` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device`
--

LOCK TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device` VALUES ('4c9a6f10-b862-44a0-89d6-a7e6f7fce535','10.0.0.100','E8:90:58:1B:89:9C',NULL,'80, 443',4,'http, https','IPCam Garage',NULL),('89e75cab-3c34-4153-a3ef-a14b33ecdb45','10.0.0.72','B9:7D:7C:5E:97:8E',NULL,'23, 8080',4,'telnet, http','Feuermelder Erdgeschoss',NULL),('e3116146-5af4-4dee-b455-87e16e050841','10.0.0.112','8A:A3:B2:FB:E2:CD',NULL,'80, 161',7,'http, snmp','Heizkessel',NULL);
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ganymed`
--

DROP TABLE IF EXISTS `ganymed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ganymed` (
  `serial_no` int(11) NOT NULL,
  `firmware` varchar(30) NOT NULL,
  `scan_running` tinyint(1) NOT NULL,
  `scheduled_scan` datetime NOT NULL,
  `license_mail` varchar(30) NOT NULL,
  `license_key` varchar(30) NOT NULL,
  PRIMARY KEY (`serial_no`),
  UNIQUE KEY `license_mail` (`license_mail`),
  UNIQUE KEY `license_key` (`license_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ganymed`
--

LOCK TABLES `ganymed` WRITE;
/*!40000 ALTER TABLE `ganymed` DISABLE KEYS */;
/*!40000 ALTER TABLE `ganymed` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group`
--

DROP TABLE IF EXISTS `group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group` (
  `group_id` varchar(10) NOT NULL,
  `alter_device_list` tinyint(1) NOT NULL,
  `run_scan` tinyint(1) NOT NULL,
  `create_user` tinyint(1) NOT NULL,
  `change_group` tinyint(1) NOT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group`
--

LOCK TABLES `group` WRITE;
/*!40000 ALTER TABLE `group` DISABLE KEYS */;
INSERT INTO `group` VALUES ('admin',1,1,1,1),('user',1,1,0,0);
/*!40000 ALTER TABLE `group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scan`
--

DROP TABLE IF EXISTS `scan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `scan` (
  `scan_no` varchar(50) NOT NULL,
  `start_time` datetime NOT NULL,
  `started_by_user` varchar(30) NOT NULL,
  `duration` int(11) NOT NULL,
  `risk_level` int(11) NOT NULL,
  PRIMARY KEY (`scan_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scan`
--

LOCK TABLES `scan` WRITE;
/*!40000 ALTER TABLE `scan` DISABLE KEYS */;
INSERT INTO `scan` VALUES ('92b4df72-a823-4e86-a390-3d08f29258f6','2017-07-05 10:09:29','admin',120,7);
/*!40000 ALTER TABLE `scan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `username` varchar(30) NOT NULL,
  `hash` varchar(200) NOT NULL,
  `group` varchar(12) NOT NULL,
  `settings` varchar(500) DEFAULT NULL,
  `mail` varchar(50) DEFAULT NULL,
  `notification_on` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('admin','$2a$10$9B3aQ.iG8ekCH34yiIt9k.8D.EdMDIyMYenQRYr.sMsyzyA0B38p.','admin','{\"mail_risk\":true,\"risklevel\":5}','thomas85@test.de.com',1),('user','$2a$10$kXUZeHR.yhmTK1AFCfOHJOCp0QO0V4gEEmE2ECsYBTZaN1rPbz1P.','user',NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-07-27 15:06:44
