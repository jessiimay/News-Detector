/////////////////////////////////dependency////////////////////////////////
var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('./mysql.js');
var moment = require('moment');
var consolidate = require('consolidate');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();//创建server
var handlebars = require('express3-handlebars').create({ defaultlayout: 'main' });


////////////////////////////////////setting//////////////////////////////////
app.set('port', process.env.PORT || 3000);
// app.engine('html', consolidate.ejs);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/public');


////////////////////////////////////midware//////////////////////////////////
app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') != 'production' && req.query.showTests === '1';
    next();
});
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());

////////////////////////////////////request//////////////////////////////////
///////////////////////pass params by local variables////////////////////////
var Request = {
    title : '',
    kw : '',
    content : ''
}

//////////////////////////////////////rout///////////////////////////////////
//服务器主页输出
app.get('/', function (req, res) {
    Request.title = req.query.title;
    Request.kw = req.query.kw;
    Request.content = req.query.content;
    console.log(Request.title);
    console.log(Request.kw);
    console.log(Request.content);
    res.render('home');
    res.redirect('/news');
    // res.send(req.body);

});

app.post('/news', function (req, res) {
    res.render('news', news);
    console.log(Request.title);
    console.log(Request.kw);
    console.log(Request.content);
    // res.send(news);
    // res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    // try {
    //     if ((title == undefined) && (req.body !== undefined)) {
    //         res.send(req.body + "title is required to search");//title is required to search
    //         console.log("!!!!fail value=");
    //     }
    //     else {
    //         var select_Sql = "select title,author,publish_date,source_name,content from fetches where (title like '%" +
    //             title + "%' or keywords like '%" + kw + "%') and content like '%" + content + "%'";
    //         if (kw == undefined && content == undefined)
    //             var select_Sql = "select title,author,publish_date,source_name,content from fetches where title like '%" +
    //                 title + "%'";
    //         else if (kw == undefined)
    //             var select_Sql = "select title,author,publish_date,source_name,content from fetches where title like '%" +
    //                 title + "%' and content like '%" + content + "%'";
    //         else if (content == undefined)
    //             var select_Sql = "select title,author,publish_date,source_name,content from fetches where title like '%" +
    //                 title + "%' and keywords like '%" + kw + "%'";


    //         let value =await mysql.promise_query(select_Sql, function (qerr, vals, fields) {
    //             console.log("Input: " + JSON.stringify(req.body));
    //         });

    //         news = value;

    //     }
    // } catch (err) {
    //     console.log(err);
    // }
    // res.end();
});




////////////////////////////////////error//////////////////////////////////
app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.write('500 - Server Error');
    res.end();
});



////////////////////////////////////server//////////////////////////////////
var server = app.listen(app.get('post'), "127.0.0.1", function () {//指跑在哪个端口

    var host = server.address().address
    var port = server.address().port
    console.log(host);
    console.log(port);

    console.log("访问地址为 http://%s:%s", host, port)

})