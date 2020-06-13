var mysql = require("mysql");//定义了mysql的具体信息
var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'crawl'
});


var query = function (sql, sqlparam, callback) {
    pool.getConnection(function (err, conn) {

        if (err) {
            callback(err, null, null);
            reject(err);
        } else {
            conn.query(sql, sqlparam, function (qerr, vals, fields) {
                conn.release(); //释放连接 
                callback(qerr, vals, fields); //事件驱动回调 
            });
        }
    });

};
var promise_query = function (sqlparam, callback) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, conn) {

            if (err) {
                callback(err, null, null);
                reject(err);
            } else {
                // conn.query(sql, sqlparam, function (qerr, vals, fields) {
                //     conn.release(); //释放连接 
                //     callback(qerr, vals, fields); //事件驱动回调 
                conn.query(sqlparam, (err, rows, fields) => {
                    console.log(sqlparam);
                    if (err) {
                        console.log("$$$$$$");
                        reject(err);
                        callback(err, null, null);
                    } else {
                        console.log("#######");
                        resolve(rows);
                    }
                    conn.release();
                });
            }
        });
    });
};


var query_noparam = function (sql, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, function (qerr, vals, fields) {
                conn.release(); //释放连接 
                callback(qerr, vals, fields); //事件驱动回调 
            });
        }
    });
};
exports.query = query;
exports.promise_query = promise_query;
exports.query_noparam = query_noparam;