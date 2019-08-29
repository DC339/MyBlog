/*
* 应用程序的启动（入口）文件
* */

//加载express模块
var express = require('express');
// 加载模板
var swig = require('swig');
// 加载数据库模块
var mongoose = require('mongoose');
// 加载body-parse，用来处理提交过来的数据
var bodyParse = require('body-parser');
// 加载cookies模块
var Cookies = require('cookies');
// 创建app应用   => NodeJS Http.createServer();
var app = express();

var User = require('./models/User');

// 设置静态文件托管
app.use('/public', express.static(__dirname + '/public'));

// 配置应用模板
app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');
//开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

// bodyparse设置
app.use(bodyParse.urlencoded({extended: true}));

//设置cookie
app.use(function(req,res,next){
    req.cookies = new Cookies(req, res);

    // 解析登录用户的cookie信息

    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //验证用户是否为管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })

        }catch(e){next();}

    }else {next();}

});

// 根据不同功能划分模块
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));


//监听http请求
mongoose.connect('mongodb://localhost:27017/blog', function (err) {
    if(err){
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(8880);
    }
});
