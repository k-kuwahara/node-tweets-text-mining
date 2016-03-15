# create database
CREATE DATABASE `db_name` CHARACTER SET utf8;

# set db_name
use db_name;

# create tables
CREATE TABLE `word_count`(
   `id`        INT(11) AUTO_INCREMENT   NOT NULL COMMENT '単語ID',
   `word`      VARCHAR(255)             NOT NULL COMMENT '単語',
   `label`     VARCHAR(255)             NOT NULL COMMENT 'ラベル',
   `count`     INT(11)      DEFAULT 0   NOT NULL COMMENT '出現回数',
   `dimension` SMALLINT(6)  DEFAULT 140          COMMENT '次元',
   PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 COMMENT='単語';

CREATE TABLE `weight_values`(
   `weight_id` SMALLINT(6) AUTO_INCREMENT NOT NULL COMMENt '重みベクトルの添字',
   `key`       VARCHAR(255)               NOT NULL COMMENT '重みベクトルのキー',
   `value`     INT(11)          DEFAULT 1 NOT NULL COMMENt '重みベクトルの値',
   PRIMARY KEY (`weight_id`)
) DEFAULT CHARSET=utf8 COMMENT='重みベクトルの値';
