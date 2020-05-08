var fs = require('fs');
var myRequest = require('request');
var myCheerio = require('cheerio');
var myIconv = require('iconv-lite');
require('date-utils');
var mysql = require('./mysql.js');//mysql在相同文件夹下的mysql.js

var source_name = "新浪新闻";
var domain = 'https://news.sina.com.cn/';
var myEncoding = "utf-8";
var seedURL = 'https://news.sina.com.cn/';

var seedURL_format = "$('a')";
var keywords_format = " $('meta[name=\"keywords\"]').eq(0).attr(\"content\")";
var title_format = "$('title').text()";
var date_format = " $('meta[property=\"article\:published\_time\"]').eq(0).attr(\"content\")";
var author_format = "$('.show_author').text()";
var content_format = "$('.article').text()";
var desc_format = " $('meta[name=\"description\"]').eq(0).attr(\"content\")";
var source_format = "$('.source').text()";
var url_reg = /\/(\d{4})\-(\d{2})\-(\d{2})\/doc\-iir([a-z]{5})(\d{7}).shtml/;


var regExp = /((\d{4}|\d{2})(\-|\/|\.)\d{1,2}\3\d{1,2})|(\d{4}年\d{1,2}月\d{1,2}日)/
let n = 0
//防止网站屏蔽我们的爬虫
var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}

//request模块异步fetch url
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        //proxy: 'http://x.x.x.x:8080',
        headers: headers,
        timeout: 10000 //
    }
    myRequest(options, callback)
};

seedget();

function seedget() {
    request(seedURL, function (err, res, body) { //读取种子页面
        try {
            //用iconv转换编码
            var html = myIconv.decode(body, myEncoding);
            // console.log(html);
            // 准备用cheerio解析html
            var $ = myCheerio.load(html, { decodeEntities: true });
        } catch (e) { console.log('读种子页面并转码出错：' + e) };
        var seedurl_news;
        try {
            seedurl_news = eval(seedURL_format);
        } catch (e) { console.log('url列表所处的html块识别出错：' + e) };
        seedurl_news.each(function (i, e) { //遍历种子页面里所有的a链接
            var myURL = "";
            try {
                //得到具体新闻url
                var href = "";
                href = $(e).attr("href");
                if (href == undefined) return;
                if (href.toLowerCase().indexOf('https://') >= 0 || href.toLowerCase().indexOf('http://') >= 0) myURL = href; //http://开头的
                else if (href.startsWith('//')) myURL = 'https:' + href; ////开头的
                else myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href; //其他

            } catch (e) { console.log('识别种子页面中的新闻链接出错：' + e) }

            if (!url_reg.test(myURL)) return; //检验是否符合新闻url的正则表达式
            console.log(myURL);

            var fetch_url_Sql = 'select url from fetches where url=?';
            var fetch_url_Sql_Params = [myURL];
            mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function (qerr, vals, fields) {
                // console.log(vals)
                if (!vals) {
                    console.log('vals=NULL')
                }
                else if (vals.length > 0) {
                    console.log('URL duplicate!')
                }
                else {
                    // window.addEventListener('load', newsGet(myURL), false);
                    newsGet(myURL); //读取新闻页面
                }
            });
        });
    });
};


function newsGet(myURL) { //读取新闻页面
    request(myURL, function (err, res, body) { //读取新闻页面
        try {
            var html_news = myIconv.decode(new Buffer(body), myEncoding); //用iconv转换编码
            // console.log(html_news);
            //准备用cheerio解析html_news
            var $ = myCheerio.load(html_news, { decodeEntities: true });
            myhtml = html_news;
        } catch (e) {
            console.log('读新闻页面并转码出错：' + e);
            return;
        };

        console.log("转码读取成功:" + myURL);
        //动态执行format字符串，构建json对象准备写入文件或数据库
        var fetch = {};
        fetch.title = "";
        fetch.content = "";
        fetch.publish_date = (new Date()).toFormat("YYYY-MM-DD");
        //fetch.html = myhtml;
        fetch.url = myURL;
        fetch.source_name = source_name;
        fetch.source_encoding = myEncoding; //编码
        fetch.crawltime = new Date();

        if (keywords_format == "") fetch.keywords = source_name; // eval(keywords_format);  //没有关键词就用sourcename
        else fetch.keywords = eval(keywords_format);
        // console.log("&&&&&keywords: " + $('meta[name="keywords"]').attr("content"));

        if (title_format == "") fetch.title = ""
        else fetch.title = eval(title_format); //标题

        // console.log(date_format);                //debug:$('meta[name="weibo: article:create_at"]').eq(0).attr("content")
        if (date_format != "") {
            // console.log("####\n");                   //debug:进入if
            // console.log(typeof date_format);         //debug:String
            // console.log(typeof eval(date_format));   //debug:undefined
            // var date = document.querySelector('meta[name=\"weibo: article:create_at\"]').getAttribute('content');
            // fetch.publish_date = date;
            fetch.publish_date = eval(date_format);
        }//刊登日期   
        // console.log('@@@@@date: ' + $('meta[property="article:published_time"]').attr("content"));
        // console.log("#####description: " + $('meta[name="description"]').attr("content"));

        if (fetch.publish_date) {
            fetch.publish_date = regExp.exec(fetch.publish_date)[0];
            fetch.publish_date = fetch.publish_date.replace('年', '-')
            fetch.publish_date = fetch.publish_date.replace('月', '-')
            fetch.publish_date = fetch.publish_date.replace('日', '')
            fetch.publish_date = new Date(fetch.publish_date).toFormat("YYYY-MM-DD");
        }


        if (author_format == "") fetch.author = source_name; //eval(author_format);  //作者
        else fetch.author = eval(author_format);

        if (content_format == "") fetch.content = "";
        else fetch.content = eval(content_format).replace("\r\n" + fetch.author, ""); //内容,是否要去掉作者信息自行决定
        console.log("@@@@@@@content: " + fetch.content);

        if (source_format == "") fetch.source = fetch.source_name;
        else fetch.source = eval(source_format).replace("\r\n", ""); //来源

        if (desc_format == "") fetch.desc = fetch.title;
        else fetch.desc = eval(desc_format);
        if (fetch.desc) fetch.desc.replace("\r\n", ""); //摘要  

        // console.log("content: " + fetch.content);
        if (fetch.content) {
            // var filename = source_name + "_" + (new Date()).toFormat("YYYY-MM-DD") +
            //     "_" + myURL.substr(myURL.lastIndexOf('/') + 1) + ".json";
            // ////存储json
            // fs.writeFileSync(filename, JSON.stringify(fetch));

            var fetchAddSql = 'INSERT INTO fetches(url,source_name,source_encoding,title,' +
                'keywords,author,publish_date,crawltime,content) VALUES(?,?,?,?,?,?,?,?,?)';
            var fetchAddSql_Params = [fetch.url, fetch.source_name, fetch.source_encoding,
            fetch.title, fetch.keywords, fetch.author, fetch.publish_date,
            fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content
            ];

            //执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
            mysql.query(fetchAddSql, fetchAddSql_Params, function (qerr, vals, fields) {
                if (qerr) {
                    console.log(qerr);
                    // con.on('error', function(err) {
                    //     console.log("[mysql error]",err);
                    //   });
                    return;
                    // console.log('qerr\n')

                }
            }); //mysql写入
        } else console.log("404 page not found.");
    });
}