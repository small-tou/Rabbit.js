config =
  run_port:5678
  mysql_table:""
  mysql_username:"root" #数据库用户名
  mysql_password:"" #数据库密码

  base_path:__dirname
  script_ext:".coffee" #编程使用的脚本后缀，支持coffee和js
  assets_head:"/assets"

  session_secret:"1234567" #session

  rainbow:
    controllers: '/controllers/'
    filters:'/filters/'
    template:'/views/'
module.exports = config
