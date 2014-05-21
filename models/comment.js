module.exports = {
    "id": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": true,
        "comment": null
    },
    "car_id": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "comment_type": {
        "type": "varchar(20)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "comment_content": {
        "type": "varchar(1024)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "to_user_id": {
        "type": "varchar(40)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "comm_time": {
        "type": "timestamp",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "user_id": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "user_name": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "head": {
        "type": "varchar(100)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    }
}