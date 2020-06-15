use crawl;
CREATE TABLE `fetches` (
  `id_fetches` int(11)  NOT NULL AUTO_INCREMENT,
  `url` varchar(200) DEFAULT NULL,
  `source_name` varchar(200) DEFAULT NULL,
  `source_encoding` varchar(45) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `keywords` varchar(200) DEFAULT NULL,
  `author` varchar(200) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `crawltime` datetime DEFAULT NULL,
  `content` longtext,
  `createtime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_fetches`),
  UNIQUE KEY `id_fetches_UNIQUE` (`id_fetches`),
  UNIQUE KEY `url_UNIQUE` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE Logger(
		id int unsigned auto_increment,
		account_id VARCHAR(255) UNIQUE NOT NULL comment '用户账号',
		operation VARCHAR(255) NOT NULL comment '操作',
		PRIMARY KEY (id)
)comment='操作列表';

CREATE TABLE Account(
		username VARCHAR(255) UNIQUE NOT NULL comment '用户名',
		passwd VARCHAR(255) NOT NULL comment '密码',
		PRIMARY KEY (username)
)comment='用户';