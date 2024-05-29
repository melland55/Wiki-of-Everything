USE WikiOfEverything;

DROP TABLE IF EXISTS `Links`;
DROP TABLE IF EXISTS `Sections`;
DROP TABLE IF EXISTS `Topics`;

CREATE TABLE IF NOT EXISTS `Topics` (
    `topic_id` INT PRIMARY KEY AUTO_INCREMENT,
    `topic` VARCHAR(63) NOT NULL,
    `link_count` INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `Sections` (
    `section_id` INT PRIMARY KEY AUTO_INCREMENT,
    `topic_id` INT NOT NULL,
    `section_title` VARCHAR(63) NOT NULL,
    `section_content` VARCHAR(4000),
    `section_order` INT NOT NULL,
    FOREIGN KEY (`topic_id`) REFERENCES `Topics` (`topic_id`)
);

CREATE TABLE IF NOT EXISTS `Links` (
    `link_id` INT PRIMARY KEY AUTO_INCREMENT,
    `source_id` INT,
    `destination_id` INT,
    FOREIGN KEY (`source_id`) REFERENCES `Topics` (`topic_id`),
    FOREIGN KEY (`destination_id`) REFERENCES `Topics` (`topic_id`)
);

INSERT INTO Topics (topic) VALUES ('Wiki of Everything');
INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (1, 'Summary', 'The Wiki of Everything is a free online <a>encyclopedia</a> created by <a>Andrew Melland</a>. The website that aims to provide a comprehensive repository of information on any subject or topic. Unlike traditional wikis, where content is generated and maintained by a community of contributors, the Wiki of Everything employs a locally running <a>Llama 3 Large Language Model</a> (LLM) to generate content in real-time.', 0);
INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (1, 'How it works', 'When a user searches for a topic on the Wiki of Everything, the LLM is queried to generate a brief article on the subject. The LLM uses its vast language understanding abilities to produce a text summary, which is then presented to the user. The generated content may include facts, figures, definitions, and even fictional information, depending on the language model''s confidence level and creative liberties taken.', 1);
INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (1, 'Content disclaimer', 'It''s essential to note that the content on the Wiki of Everything is not reviewed, verified, or fact-checked by humans. As such, the accuracy and authenticity of the information provided cannot be guaranteed. The website explicitly warns that the content is not intended to be taken as factual or reliable and should be treated with caution.', 2);
INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (1, 'Limitations and potential biases', 'The Wiki of Everything''s reliance on a single LLM may introduce limitations and biases in the generated content. The model''s training data may not be representative of the entire internet, and its output may reflect the biases and inaccuracies present in its training data. Additionally, the LLM''s ability to hallucinate and generate fictional information can lead to inaccuracies and misinformation.', 3);
INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (1, 'Usage and purpose', 'Despite the limitations, the Wiki of Everything can be a useful tool for individuals looking for inspiration or informational tidbits. The website can serve as a thought-provoking tool, encouraging users to fact-check and verify information before citing or relying on it.', 4);
INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (1, 'Technical details', 'The Wiki of Everything is powered by a locally running <a>Llama 3</a> LLM, which is trained on a large <a>corpus</a> of text data. The website is built using modern <a>web technologies</a>, including <a>React</a>, <a>Python</a>, and <a>MySQL</a>. The <a>LLM</a> is updated regularly to improve its performance and accuracy.', 5);
INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (1, 'Conclusion', 'Overall, the Wiki of Everything is an innovative project that pushes the boundaries of language generation and online information dissemination. While it comes with its limitations and potential biases, it can be a fascinating tool for exploring unconventional topics and ideas.', 6);
