module.exports = {
  "id": {
    "type": "varchar(255)",
    "allowNull": false,
    "defaultValue": null,
    "primaryKey": true,
    "comment": null
  },
  "code": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "name": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "type": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "level": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "parent": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "en_name": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "description": {
    "type": "text",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "update_date": {
    "type": "date",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "dindex": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  }
}