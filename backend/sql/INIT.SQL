USE WikiOfEverything;

DROP TABLE IF EXISTS `Sections`;
DROP TABLE IF EXISTS `Topics`;

CREATE TABLE IF NOT EXISTS `Topics` (
    `topic_id` INT PRIMARY KEY AUTO_INCREMENT,
    `topic` VARCHAR(63) NOT NULL,
    `summary` VARCHAR(4000) NOT NULL
);

CREATE TABLE IF NOT EXISTS `Sections` (
    `section_id` INT PRIMARY KEY AUTO_INCREMENT,
    `topic_id` INT NOT NULL,
    `section_title` VARCHAR(63) NOT NULL,
    `section_content` VARCHAR(4000),
    `section_order` INT NOT NULL,
    FOREIGN KEY (`topic_id`) REFERENCES `Topics` (`topic_id`)
);