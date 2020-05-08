let mysql = require("mysql");
let n=0;    //控制连接次数
const db_config={
    host:"localhost",
    user:"root",
    password:"root",
    port:"3306",
    database:"crawl" 
}
let connect=mysql.createConnection(db_config);
//开始链接数据库
connect.connect(function(err){
    if(err){
        console.log(`mysql连接失败: ${err},正在重新连接...`);
        setTimeout(function(){autoConnect(connect);},2000); //2s重新连接
    }else{
        console.log("mysql连接成功!");
        sqlQuery(connect);
    }
});
function sqlQuery(connect){//做些优化，之前代码如果数据库链接失败也会执行query()
        //基本的查询语句
    let sqlQuery="select * from 163";
    connect.query(sqlQuery,function(err,result){
        if(err){
            console.log(`SQL error: ${err}!`);
        }else{
            console.log(result);
            closeMysql(connect);
        }
    });
}
//查询成功后关闭mysql
function closeMysql(connect){
    connect.end((err)=>{
        if(err){
            console.log(`mysql关闭失败:${err}!`);
        }else{
            console.log('mysql关闭成功!');
        }
    });
    // connect.destory();   //end()和destory()都可以关闭数据库
}
//数据连接失败后自动连接控制连接—次数10次
function autoConnect(connect){
    if(n<=10){
        n++;
        connect.connect(function(err){
            if(err){
                console.log(`mysql自动连接:${n}`);
                setTimeout(function(){autoConnect(connect)},2000);
            }else{
                console.log("mysql连接成功!");
                sqlQuery(connect);
            }
        });
    }else{
        console.log("真尽力连不上，检查其他问题吧!");
    }
}