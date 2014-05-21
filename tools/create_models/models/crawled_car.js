module.exports = {
  "ID": {
    "type": "varchar(40)",
    "allowNull": false,
    "defaultValue": "",
    "primaryKey": true,
    "comment": null
  },
  "vin_number": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "车架号"
  },
  "brand": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "车辆品牌"
  },
  "series": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "车系"
  },
  "model": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "车型"
  },
  "souche_model": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "搜车网车型"
  },
  "price": {
    "type": "bigint(20)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "价格"
  },
  "seller_name": {
    "type": "varchar(15)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "卖家名称"
  },
  "seller_phone": {
    "type": "varchar(15)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "卖家电话"
  },
  "first_license_plate_date": {
    "type": "date",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "首次上牌时间"
  },
  "mileage": {
    "type": "bigint(20)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "里程"
  },
  "remark": {
    "type": "text",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "车辆配置"
  },
  "pictures": {
    "type": "longtext",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "图片"
  },
  "brand_code": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "品牌code"
  },
  "series_code": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "系列code"
  },
  "model_code": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "型号code"
  },
  "filter_status": {
    "type": "smallint(6)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "过滤状态-0-不用过滤的数据（实际可用数据），1-品牌空，2-价格空，3-系列空，4-图片空，5-license_time空，6-mileage空，7-卖家电话为空，8-license_time未上牌，9-不符合的-brand＝中华等license_time＝2009年1月之前，10-不符合的 2007年1月 之前，11-mileage>15w公里的车辆，12-过滤掉不与我们合作的经销商（卖家）"
  },
  "date_create": {
    "type": "timestamp",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "date_update": {
    "type": "timestamp",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "date_delete": {
    "type": "timestamp",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "model_url": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "信息来源"
  },
  "hash_key": {
    "type": "varchar(40)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "brand,series,model,seller_phone,mileage求hash"
  },
  "crawl_source": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "抓取来源:0-车牛发车 1-华夏二手车 2-58个人车源"
  },
  "judge_status": {
    "type": "tinyint(3)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "审核状态0-未审核，1- 审核通过，2- 审核未通过"
  },
  "judge_id": {
    "type": "varchar(45)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "审核人员"
  },
  "judge_pass_date": {
    "type": "timestamp",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "审核通过时间"
  },
  "judge_text": {
    "type": "varchar(1000)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "审核描述"
  },
  "yushou_number": {
    "type": "varchar(40)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "抓取预售号"
  },
  "emissions": {
    "type": "varchar(40)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "排放-(外部合作字段)"
  },
  "area": {
    "type": "varchar(40)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "地区"
  },
  "voice": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "summary": {
    "type": "varchar(1000)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "status": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "1",
    "primaryKey": false,
    "comment": "0:下架 1：上架 2：删除"
  },
  "is_valid_vin": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "0:vin码无效 1:vin码有效"
  },
  "user_id": {
    "type": "varchar(15)",
    "allowNull": false,
    "defaultValue": null,
    "primaryKey": false,
    "comment": "同post_car中的phone"
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
    "defaultValue": null,
    "primaryKey": false,
    "comment": "营运性质"
  }
}