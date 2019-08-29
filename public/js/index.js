/*Created by F.s on 2019/6/30*/

$(function(){

    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');
    var $logout = $('#logout');

    //切换到注册页面
    $loginBox.find('a.colMint').on('click', function(){
        $loginBox.hide();
        $registerBox.show();
    })

    //切换到登录面板
    $registerBox.find('a.colMint').on('click', function(){
        $registerBox.hide();
        $loginBox.show();
    })

    //注册
    $registerBox.find('button').on('click', function(){
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name = "username"]').val(),
                password: $registerBox.find('[name = "password"]').val(),
                repassword: $registerBox.find('[name = "repassword"]').val()
            },
            dataType: 'json',
            success: function(result){
                $registerBox.find('.colWarning').html(result.message);

                if(!result.code){
                    window.location.reload();
                    // setTimeout(function(){
                    //     $registerBox.hide();
                    //     $loginBox.show();
                    // },1000)
                }
            }
        });
    });

    // 登录
    $loginBox.find('button').on('click', function(){
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginBox.find('[name = "username"]').val(),
                password: $loginBox.find('[name = "password"]').val()
            },
            dataType: 'json',
            success: function(result){
                $loginBox.find('.colWarning').html(result.message);

                if(!result.code){
                    //登陆成功 重载当前页面
                    window.location.reload();
                }
            }
        })
    })

    // 退出
    $logout.on('click', function(){
        $.ajax({
            url: '/api/user/logout',
            success: function(result){
                if(!result.code){
                    window.location.reload();
                }
            }
        })
    })
})
