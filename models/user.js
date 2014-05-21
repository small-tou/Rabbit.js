module.exports = {
    "phone": {
        "type": "char(20)",
        "allowNull": false,
        "primaryKey": true,
        "comment": "电话"
    },
    "name": {
        "type": "varchar(50)",
        "allowNull": false,
        "primaryKey": false,
        "comment": "姓名"
    },
    "register_time": {
        "type": "datetime",
        "allowNull": false,
        "primaryKey": false,
        "comment": "注册时间"
    },
    "head_url": {
        "type": "varchar(100)",
        "allowNull": true,
        "primaryKey": false,
        "comment": null
    },
    "introduce": {
        "type": "text",
        "allowNull": true,
        "primaryKey": false,
        "comment": "简介"
    },
    "last_login_time": {
        "type": "datetime",
        "allowNull": true,
        "primaryKey": false,
        "comment": null
    },
    "status": {
        "type": "varchar(20)",
        "allowNull": true,
        "primaryKey": false,
        "comment": "用户状态，login,notlogin,crawl(抓取数据中的用户信息，未正式注册)"
    },
    "current_phone": {
        "type": "varchar(15)",
        "allowNull": false,
        "primaryKey": false,
        "comment": null
    }
}