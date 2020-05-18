/////////////////////////////////dependency////////////////////////////////
var mysql = require('./mysql.js');
var moment = require('moment');
// var consolidate = require('consolidate');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();//创建server
var handlebars = require('express3-handlebars').create({ defaultlayout: 'main' });


////////////////////////////////////setting//////////////////////////////////
app.set('port', 3000);
//app.set('port', process.env.PORT || 3000);
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
    title: '',
    kw: '',
    content: ''
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
    if (Request.title == undefined) {
        res.render('home');
    } else if (Request.title == undefined) {
        res.render('home');
    } else {
        res.redirect('/news?title=' + Request.title + '&kw=' + Request.kw + '&content=' + Request.content);
    }
    // res.render('home');
    // res.redirect('/news');
    // res.send(req.body);

});

app.get('/news*', async function (req, res) {
    // res.render('news', news);
    console.log(Request.title);
    console.log(Request.kw);
    console.log(Request.content);
    // res.send(news);
    // res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    try {
        if ((Request.title == undefined) && ((Request.kw !== undefined) || (Request.content !== undefined))) {
            res.send(req.body + "title is required to search");//title is required to search
            console.log("!!!!fail value=");
        }
        else {
            var select_Sql = "select title,author,publish_date,source_name,content from fetches where (title like '%" +
                Request.title + "%' or keywords like '%" + Request.kw + "%') and content like '%" + Request.content + "%'";
            if (Request.kw == undefined && Request.content == undefined)
                var select_Sql = "select title,author,publish_date,source_name,content from fetches where title like '%" +
                    Request.title + "%'";
            else if (Request.kw == undefined)
                var select_Sql = "select title,author,publish_date,source_name,content from fetches where title like '%" +
                    Request.title + "%' and content like '%" + Request.content + "%'";
            else if (Request.content == undefined)
                var select_Sql = "select title,author,publish_date,source_name,content from fetches where title like '%" +
                    Request.title + "%' and keywords like '%" + Request.kw + "%'";


            let value = await mysql.promise_query(select_Sql, function (qerr, vals, fields) {
                console.log("Input: " + JSON.stringify(req.body));
            });
            // console.log(typeof news);
            // console.log(news);
            var num = 0;
            var Freshness = 0;
            for (var i in value) {
                num += 1;
            }
            var Popularity = Math.exp(-1 / num);
            var news = '';
            for (var j = 0; j < num; j++) {
                var publish_date = moment(value[j].publish_date).format('YYYY-MM-DD');
                var now = moment().format('YYYY-MM-DD');
                var delta = (new Date(publish_date) - new Date(now)) / (1000 * 60 * 60 * 24);
                // console.log("delta time="+delta);
                if (Math.exp(delta / 10) > Freshness) Freshness = Math.exp(delta / 10);

                news += "<div class=\"sec-title text-center white wow animated fadeInDown\">  <h2 color=\"white\">" + value[j].title + "</h2> </div> <br>" +
                    + "<div  text-align=\"center\" line-height=\"100px\" font-size=\"20px\">" + value[j].author + "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" + publish_date + "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" + value[j].source_name + "<br>"
                   + "<p style=\"white-space:pre-wrap\"> " + value[j].content + "</p></div><br><br>";
            }

            res.render('news', { body: news, F: (Freshness*100).toFixed(1)+"%", P: (Popularity*100).toFixed(1)+"%" });

        }
    } catch (err) {
        console.log(err);
    }
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
var server = app.listen(app.get('port'), "127.0.0.1", function () {//指跑在哪个端口

    var host = server.address().address
    var port = server.address().port
    console.log(host);
    console.log(port);

    console.log("访问地址为 http://%s:%s", host, port)

})