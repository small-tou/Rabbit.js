config =
  run_port:5678
  mysql_table:""
  mysql_username:"root" #数据库用户名
  mysql_password:"" #数据库密码
  upload_path:__dirname+"/uploads/"
  base_path:__dirname
  "upyun_bucketname":"",
  "upyun_username":"",
  "upyun_password":"",
  script_ext:".coffee"
  assets_head:"/assets"#http://htmljs.b0.upaiyun.com/"
module.exports = config
