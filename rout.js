var express = require('express');
var app = express();

//  主页输出 "Hello World"
app.get('/', function(req, res) {
    console.log("主页 GET 请求");
    res.send('Hello GET');
})

// 对页面 abcd, abxcd, ab123cd, 等响应 GET 请求
app.get('/ab*cd', function(req, res) {
    console.log("/ab*cd GET 请求");
    res.send('正则匹配');
})

var server = app.listen(8081, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("访问地址为 http://%s:%s", host, port)

})