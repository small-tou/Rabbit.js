module.exports = {
    "ID": {
        "type": "varchar(40)",
        "allowNull": false,

        "primaryKey": true,
        "comment": null
    },
    "vin": {
        "type": "varchar(50)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "price": {
        "type": "varchar(20)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "area": {
        "type": "varchar(30)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "brand": {
        "type": "varchar(20)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "series": {
        "type": "varchar(50)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "model": {
        "type": "varchar(120)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "create_time": {
        "type": "timestamp",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "user_id": {
        "type": "varchar(15)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "summary": {
        "type": "varchar(1000)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "last_update_time": {
        "type": "timestamp",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "status": {
        "type": "tinyint(4)",
        "allowNull": true,
        "defaultValue": "3",
        "primaryKey": false,
        "comment": "1：上架  0：下架 2：删除 3：审核中 4:审核不通过"
    },
    "seller_name": {
        "type": "varchar(30)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "emission": {
        "type": "varchar(20)",
        "allowNull": true,

        "primaryKey": false,
        "comment": "排放标准"
    },
    "voice": {
        "type": "varchar(100)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "pictures": {
        "type": "varchar(1600)",
        "allowNull": true,

        "primaryKey": false,
        "comment": null
    },
    "is_valid_vin": {
        "type": "int(11)",
        "allowNull": false,
        "defaultValue": "0",
        "primaryKey": false,
        "comment": null
    },
    "phone": {
        "type": "varchar(15)",
        "allowNull": false,

        "primaryKey": false,
        "comment": null
    },
    "mileage": {
        "type": "bigint(20)",
        "allowNull": false,

        "primaryKey": false,
        "comment": "里程数"
    },
    "on_card_date": {
        "type": "timestamp",
        "allowNull": false,
        "defaultValue": "0000-00-00 00:00:00",
        "primaryKey": false,
        "comment": "上牌时间"
    },
    "service_type": {
        "type": "varchar(20)",
        "allowNull": false,

        "primaryKey": false,
        "comment": "营运性质"
    }
}