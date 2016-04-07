# create database
CREATE DATABASE IF NOT EXISTS `db_name` CHARACTER SET utf8;

# set db_name
use db_name;

# create tables
CREATE TABLE IF NOT EXISTS `word_count`(
   `id`        INT(11) AUTO_INCREMENT   NOT NULL COMMENT '単語ID',
   `word`      VARCHAR(255)             NOT NULL COMMENT '単語',
   `label`     VARCHAR(255)             NOT NULL COMMENT 'ラベル',
   `count`     INT(11)      DEFAULT 0   NOT NULL COMMENT '出現回数',
   PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 COMMENT='単語';

CREATE TABLE IF NOT EXISTS `weight_values`(
   `weight_id` SMALLINT(6) AUTO_INCREMENT NOT NULL COMMENt '重みベクトルの添字',
   `keystr`    VARCHAR(255)               NOT NULL COMMENT '重みベクトルのキー',
   `value`     INT(11)          DEFAULT 1 NOT NULL COMMENt '重みベクトルの値',
   PRIMARY KEY (`weight_id`)
) DEFAULT CHARSET=utf8 COMMENT='重みベクトルの値';

# initial datas
INSERT INTO `word_count`(`word`, `label`, `count`) VALUES
('好き', '1', 0),
('すき', '1', 0),
('スキ', '1', 0),
('良い', '1', 0),
('いい', '1', 0),
('最高', '1', 0),
('さいこう', '1', 0),
('イイ', '1', 0),
('凄い', '1', 0),
('すごい', '1', 0),
('スゴイ', '1', 0),
('すげえ', '1', 0),
('スゲエ', '1', 0),
('すげぇ', '1', 0),
('スゲェ', '1', 0),
('やばい', '1', 0),
('ヤバイ', '1', 0),
('嫌い', '-1', 0),
('きらい', '-1', 0),
('キライ', '-1', 0),
('悪い', '-1', 0),
('わるい', '-1', 0),
('ワルイ', '-1', 0),
('悪', '-1', 0),
('最悪', '-1', 0),
('サイアク', '-1', 0),
('駄目', '-1', 0),
('だめ', '-1', 0),
('ダメ', '-1', 0),
('酷い', '-1', 0),
('ひどい', '-1', 0),
('ヒドイ', '-1', 0),
('ダメ', '-1', 0),
('嫌', '-1', 0),
('いや', '-1', 0),
('イヤ', '-1', 0),
('あかん', '-1', 0),
('アカン', '-1', 0);

# initial datas
delimiter //
CREATE PROCEDURE insert_default_value(in x int, in y int)
BEGIN
WHILE x <= y DO
INSERT INTO weight_values(keystr) VALUES(CONCAT("w", x));
SET x = x + 1;
END WHILE;
END
//

delimiter ;
CALL insert_default_value(1, 38);
