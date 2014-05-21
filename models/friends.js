module.exports = {
    "user_id": {
        "type": "varchar(40)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "friend_id": {
        "type": "varchar(40)",
        "allowNull": true,

        "primaryKey": false,
        "comment": "好友的id"
    },
    "create_time": {
        "type": "timestamp",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "id": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": true,
        "comment": null
    }
}