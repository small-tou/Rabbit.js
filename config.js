  var config;

  config = {
      run_port: 5678,
      mysql_host: "127.0.0.1", //数据库地址
      mysql_table: "example", //数据库表名
      mysql_username: "root", //数据库用户名
      mysql_password: "", //数据库密码
      base_path: __dirname, //应用根路径，程序中常用
      script_ext: ".js", //编程用的脚本后缀
      assets_head: "/assets",
      session_secret: "1234567", //session
      //rainbow的配置
      rainbow: {
          controllers: '/controllers/',
          filters: '/filters/',
          template: '/views/'
      },
      mongo_config: {
          db: {
              native_parser: true
          },
          server: {
              poolSize: 5
          },
          replset: {
              rs_name: 'myReplicaSetName'
          },
          user: '',
          pass: '',
          host: "localhost",
          port: "27017",
          database: "local"
      }
  };

  module.exports = config;