DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    users_ID        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE CHECK (position('@' in email) > 1),
    user_password   VARCHAR(50) NOT NULL UNIQUE CHECK(char_length(user_password) >= 8),
    user_role       VARCHAR(10) NOT NULL CHECK (user_role IN('student','Student','teacher','Teacher','admin')),
    date_of_birth   DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years'),
    profile_pic_url TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);


INSERT INTO users (first_name, last_name, email, user_password, user_role, date_of_birth)
VALUES

('Abdul Haadhi', 'Shameen', 'asha0277@student.monash.edu', 'abcdefgh', 'student', '2000-05-15'),
('Chi Cheng', 'Chan', 'ccha0249@student.monash.edu', '12345678', 'student', '2001-08-22'),
('Benjamin', 'Gue', 'bgue0003@student.monash.edu', '!@#$%^&*', 'student', '1999-02-11'),
('Jena', 'Khatri', 'jena0017@student.monash.edu', 'ASDGY43&', 'student', '2002-09-30'),
('Jessica Rose', 'Pianta', 'jpia0005@student.monash.edu', 'QWGHJFUI', 'student', '2000-12-05'),
('Kayla', 'Robinson', 'krob0036@student.monash.edu', '876543210', 'student', '2001-06-18'),
('Rachel', 'Tham', 'rtha0035@student.monash.edu', '^^__@@!!', 'student', '2003-03-25'),

SELECT * FROM users;