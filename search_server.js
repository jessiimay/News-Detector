var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('./mysql.js');
var moment = require('moment');

var htmlhead =
    // '<section id="testimonials" class="parallax">'+
    '<div class="overlay">' +
    '<div class="container">' +
    '<div class="row">' +
    // '<div class="sec-title text-center white wow animated fadeInDown">'+
    //     '<h2>News:</h2>'+
    // '</div>'+
    '<div id="testimonial" class=" wow animated fadeInUp">';
var htmltail = '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // '</section>'
    async function main(data) {


    }

http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var params = url.parse(request.url, true).query;
    fs.readFile(pathname.substr(1), async function (err, data) {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        try {
            if ((params.title === undefined) && (data !== undefined)) {
                response.write(data.toString());//title is required to search
                console.log("!!!!fail value=" + value);
            }
            else {//search with title
                // response.write(JSON.stringify(params));
                var select_Sql = "select title,author,publish_date,source_name,content from fetches where title like '%" +
                    params.title + "%' or keywords like '%" + params.kw + "%' or content like '%" + params.content + "%'";
                let value = await mysql.promise_query(select_Sql, function (qerr, vals, fields) {
                    console.log("Input: " + JSON.stringify(params));
                });
                // console.log("Output=" + JSON.stringify(value));

                // response.write(htmlhead);
                var num = 0;
                var Fresh = 0;
                for (var i in value) {
                    num += 1;
                }
                var Hot = Math.exp(-1/num);
                
                for (var j = 0; j < num; j++) {
                    var publish_date = moment(value[j].publish_date).format('YYYY-MM-DD');
                    var now = moment().format('YYYY-MM-DD');
                    var delta = (new Date(publish_date) - new Date(now))/(1000*60*60*24);
                    console.log("delta time="+delta);
                    if(Math.exp(delta/10) > Fresh) Fresh = Math.exp(delta/10);


                    // response.write('<div class="testimonial-item text-center">'+                                
                    //                     '<div class="clearfix">');
                    response.write("<h1>" + value[j].title + "</h1><br>");
                    response.write(value[j].author + "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" + publish_date + "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" + value[j].source_name + "<br>");
                    response.write("<p>" + value[j].content + "</p><br><br>");
                    // response.write('</div>'+'</div>'+'</div>'+'</div>'+'</div>'+'</div>'+'</section>'+"</body>"+"</html>");
                }
                // response.write(htmltail);
                response.write("<h2>Popularity:  " + (Hot*100).toFixed(1) + "%&emsp;&emsp;&emsp;"+ "Freshness:  " + (Fresh*100).toFixed(1) +"%<h2>"); 

            }
        } catch (err) {
            console.log(err);
        }
        response.end();
    });
}).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');