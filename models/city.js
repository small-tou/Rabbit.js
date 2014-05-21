module.exports = {
    "id": {
        "type": "int(11)",
        "allowNull": false,

        "primaryKey": true,
        "comment": null
    },
    "city_index": {
        "type": "int(11)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "province_id": {
        "type": "int(11)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "name": {
        "type": "varchar(100)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    }
}