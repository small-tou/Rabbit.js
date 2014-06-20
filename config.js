  var config;

  config = {
      run_port: 8080,


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
      //如果需要使用mysql，则去掉mysql_config的注释并修改为自己的数据库信息
      //如果需要使用mongo，则去掉mongo_config的注释并修改为自己的配置。
      //

      // mysql_config: {
      //     host: "127.0.0.1", //数据库地址
      //     database: "example", //数据库表名
      //     username: "root", //数据库用户名
      //     password: "", //数据库密码
      // },
      // 
      // mongo_config: {
      //     db: {
      //         native_parser: true
      //     },
      //     server: {
      //         poolSize: 5
      //     },
      //     user: '',
      //     pass: '',
      //     host: "localhost",
      //     port: "27017",
      //     database: "local"
      // }
  };

  module.exports = config;