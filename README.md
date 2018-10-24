# Description 
Convert SQL Schema Dumps to Exportable Sequelize Models.

# Usage

### Required Directory Structure
```sh
root
    |- dumps
        |- users.sql
    |- models
        |- SchemaParser.js
```

### Excecution

```sh
cd models/
node SchemaParser.js
```

### Example

```
// dumps/users.sql

-- MySQL dump 10.13  Distrib 5.7.23, for Linux (x86_64)
--
-- Host: localhost    Database: Test
-- ------------------------------------------------------
-- Server version	5.7.23-0ubuntu0.18.04.1
--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(55) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mid_name` varchar(155) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(55) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1095 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;

-- Dump completed on 2018-10-12 11:27:41
```

### Output

```
// models/users.js

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(users, {
      id: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING(55),
        defaultValue: NULL,
      },
      mid_name: {
        type: DataTypes.STRING(155),
        defaultValue: NULL,
      },
      last_name: {
        type: DataTypes.STRING(55),
        defaultValue: NULL,
      },
      email: {
        type: DataTypes.STRING(255),
        defaultValue: NULL,
      },
      mobile: {
        type: DataTypes.STRING(25),
        defaultValue: NULL,
      },
      password: {
        type: DataTypes.STRING(255),
        defaultValue: NULL,
      },
      created_at: {
        type: timestamp,
        defaultValue: NULL,
      },
      updated_at: {
        type: timestamp,
        defaultValue: NULL,
      },
  });
  return Users;
}
```

### Dependencies
Nodejs 6+