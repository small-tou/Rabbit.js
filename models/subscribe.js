module.exports = {
    "user_id": {
        "type": "varchar(20)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "brand": {
        "type": "varchar(30)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "price_low": {
        "type": "int(11)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "emission": {
        "type": "varchar(50)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "location": {
        "type": "varchar(50)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "series": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "price_high": {
        "type": "int(11)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "subscribe_date": {
        "type": "timestamp",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "ID": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": true,
        "comment": null
    }
}