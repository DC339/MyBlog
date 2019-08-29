/*Created by F.s  2019/6/29*/

var  express = require('express');
var router = express.Router();

var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function(req, res, next){
    if(!req.userInfo.isAdmin){
        // 如果当前用户非管理员
        res.send("对不起，只有管理员才能进入管理界面");
        return;
    }
    next();
});

// 管理界面首页
router.get('/', function(req, res, next){
    res.render( 'admin/index', {
        userInfo: req.userInfo
    } );
});

// 用户管理
router.get('/user', function(req, res){
    var page = Number(req.query.page || 1);   //当前页
    var limit = 5;  //每页限制为多少条
    var skip = 0;   //忽略的页数
    var pages = 0;  //总页数
    var arr = [];

    //分页展示
    User.count().then(function(count){
        // 计算总页数
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);   //不超过最大页数
        page = Math.max(page, 1);   //不小于最小页数
        skip = (page - 1) * limit;

        for(let i=1;i<=pages;i++){
            arr.push(i)
        }

        User.find().limit(limit).skip(skip).then(function(users){
            // 从数据库中读取所有的用户数据
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,

                count: count,
                page: page,
                limit: limit,
                pages: pages,
                arr: arr
            });
        });
    });

});

//分类界面

//分类首页
router.get('/category', function(req,res){

    pages(req, res, 5, Category, 'admin/category_index');

});

//分类管理
router.get('/category/add', function(req, res){
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});

router.post('/category/add', function(req, res){

    //检测名字是否为空
    var name = req.body.name || '';

    if(!name){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类名称不能为空'
        });
        return;
    }

    Category.findOne({name: name}).then(function(rs){
        if(rs){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类名字已存在'
            });

            return Promise.reject();
        }else {
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类名称保存成功',
            url: '/admin/category'
        });
    })
});

//编辑分类条目
router.get('/category/edit', function(req, res){
    //获取要修改的分类信息，并用表单的形式展现出来
    var id = req.query.id || '';
    // console.log(id);

    // 获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        }else{
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    })
});
//保存分类
router.post('/category/edit', function(req, res){
    var id = req.query.id || '';
    var name = req.body.name || '';
    // console.log(id);
    Category.findOne({_id: id}).then(function(category){
        // console.log(category);
        if(!category){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        }else{
            if(name == category.name){
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            }else{
                return Category.findOne({
                    _id: {$ne: id},//id不等于当前id
                    name: name
                });
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已有同名类名'
            });
            return Promise.reject();
        }else{
            return Category.updateOne({
                _id: id
            },{
                name: name
            });
        }
    }).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        });
    })
});

//删除分类条目
router.get('/category/delete', function(req, res){
    var id = req.query.id || '';

    Category.remove({
        _id: id
    }).then(function(category){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        });

    });
});

//内容首页
router.get('/content', function(req, res){

    // pages(req, res, 5, Content, 'admin/content_index');
    var page = Number(req.query.page || 1);   //当前页
    var limit = 5;  //每页限制为多少条
    var skip = 0;   //忽略的页数
    var pages = 0;  //总页数
    var arr = [];

    //分页展示
    Content.count().then(function(count){
        // 计算总页数
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);   //不超过最大页数
        page = Math.max(page, 1);   //不小于最小页数
        skip = (page - 1) * limit;

        for(let i=1;i<=pages;i++){
            arr.push(i)
        }

        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category', 'user']).sort({addTime:-1}).then(function(contents){
            console.log(contents);
            // 从数据库中读取所有的用户数据
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents:contents,

                count: count,
                page: page,
                limit: limit,
                pages: pages,
                arr: arr
            });
        });
    });
});
//内容添加
router.get('/content/add', function(req, res){
    Category.find().sort({_id:-1}).then(function(categories){
        res.render('admin/content_add', {
            userInfo:req.userInfo,
            categories: categories
        });
    });

});
//内容保存
router.post('/content/add',function(req, res){
    // console.log(req.body);

    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return Promise.reject();
    }else if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return Promise.reject();
    }else{
        new Content({
            category: req.body.category,
            title: req.body.title,
            user: req.userInfo._id.toString(),
            description: req.body.description,
            content: req.body.content
        }).save().then(function(rs){
            res.render('admin/success',{
                userInfo: req.userInfo,
                message: '保存成功',
                url: '/admin/content'
            })
        });
    }

});

//修改内容
router.get('/content/edit', function(req, res){
    //获取要修改的分类信息，并用表单的形式展现出来
    var id = req.query.id || '';
    // console.log(id);
    Category.find().sort({_id:1}).then(function(categories){
        // categories = rs;
        // 获取要修改的分类信息
        return Content.findOne({
            _id: id
        }).populate(['category', 'user']).then(function(content) {
            if (!content) {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '分类信息不存在'
                });
                return Promise.reject();
            } else {
                res.render('admin/content_edit', {
                    userInfo: req.userInfo,
                    content: content,
                    categories: categories
                })
            }
        })
    })

});


//保存修改内容
router.post('/content/edit', function(req, res){
    var id = req.query.id || '';
    if(req.body.category == ''){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容类别不能为空'
        });
        return;
    }
    if(req.body.title == ''){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return;
    }
    Content.update({_id:id},{
        categories: req.body.categories,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容修改成功',
            url: '/admin/content?id='+id
        })
    })
});

// 内容删除
router.get('/content/delete', function(req,res){
    var id = req.query.id || '';

    Content.remove({_id:id}).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        })
    })
})


module.exports = router;

function pages(req, res, limit, dbname, url){
    var page = Number(req.query.page || 1);   //当前页
    // var limit = num;  //每页限制为多少条
    var skip = 0;   //忽略的页数
    var pages = 0;  //总页数
    var arr = [];

    //分页展示
    dbname.count().then(function(count){
        // 计算总页数
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);   //不超过最大页数
        page = Math.max(page, 1);   //不小于最小页数
        skip = (page - 1) * limit;

        for(let i=1;i<=pages;i++){
            arr.push(i)
        }

        dbname.find().sort({_id:-1}).limit(limit).skip(skip).then(function(rs){
            // 从数据库中读取所有的用户数据
            res.render(url, {
                userInfo: req.userInfo,
                categories: rs,
                users: rs,
                content:rs,

                count: count,
                page: page,
                limit: limit,
                pages: pages,
                arr: arr
            });
        });
    });
}