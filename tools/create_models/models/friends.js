module.exports = {
  "user_id": {
    "type": "varchar(40)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "friend_id": {
    "type": "varchar(40)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "好友的id"
  },
  "create_time": {
    "type": "timestamp",
    "allowNull": false,
    "defaultValue": "CURRENT_TIMESTAMP",
    "primaryKey": false,
    "comment": null
  },
  "id": {
    "type": "varchar(40)",
    "allowNull": false,
    "defaultValue": null,
    "primaryKey": true,
    "comment": null
  }
}