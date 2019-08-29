/*Created by F.s  2019/6/29*/

var  express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Content');

// 统一返回格式
var responseData;
router.use( function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    };
    next();
});
// 用户注册
/*注册逻辑：1 用户名不能为空 2 密码不能为空  3 两次输入密码必须一致   数据库验证：1 用户是否已经被注册了*/

router.post('/user/register', function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if(username == ""){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    if(password == ""){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码必须一致';
        res.json(responseData);
        return;
    }

    User.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo){
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json(responseData);
            return;
        }
        //保存用户注册的信息到数据库中
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function(newUserInfo){

        // console.log(newUserInfo);
        responseData.message = '注册成功';
        responseData.userInfo = {
            _id: newUserInfo._id,
            username: newUserInfo.username
        }
        req.cookies.set('userInfo', JSON.stringify({
            _id: newUserInfo._id,
            username: newUserInfo.username
        }));

        res.json(responseData);
    });

});

//登录
router.post('/user/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }
    // 查询数据库中相同用户名和密码是否存在 并且一致，如果存在就登录
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        // 如果用户信息不存在则
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        // 若用户名和密码正确
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        }
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return;
    });
});


// 退出
router.get('/user/logout', function(req, res){
    req.cookies.set('userInfo', null);
    res.json(responseData);
});

/*
* 获取指定文章的所有评论
* */
router.get('/comment', function(req, res) {
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function(content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});

/*
* 评论提交
* */
router.post('/comment/post', function(req, res) {
    //内容的id
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent) {
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});


module.exports = router;