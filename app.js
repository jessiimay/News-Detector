var express = require('express');
var app = express();//创建server

//服务器主页输出
app.get('/', function(req, res) {
    res.send('Hello World');
})

var server = app.listen(8081, "127.0.0.1", function() {//指跑在哪个端口

    var host = server.address().address
    var port = server.address().port
    console.log(host);
    console.log(port);

    console.log("访问地址为 http://%s:%s", host, port)

})