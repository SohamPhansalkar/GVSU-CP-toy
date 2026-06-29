-- create database CPToy;

use CPToy;

create table user(
	email varchar(50) primary key,
    password varchar(50),
    name varchar(50),
    age int,
    gender enum("male", "female", "other", "prefer not to say")
);

alter table user add column (controller1 varchar(50) unique, controller2 varchar(50) unique);

create table controlls(
	controller1 varchar(50),
    controller2 varchar(50),
    mainCount int,
    count1 int,
    count2 int,
    count3 int,
    count4 int,
    FOREIGN KEY (controller1) REFERENCES user(controller1),
    FOREIGN KEY (controller2) REFERENCES user(controller2)
);

DELIMITER //

CREATE TRIGGER after_user_insert
AFTER INSERT ON user
FOR EACH ROW
BEGIN
    -- Inserts a default row with 0 counts. 
    -- The controller1 and controller2 values will be NULL initially.
    INSERT INTO controlls (controller1, controller2, mainCount, count1, count2, count3, count4)
    VALUES (NEW.controller1, NEW.controller2, 0, 0, 0, 0, 0);
END //

DELIMITER ;