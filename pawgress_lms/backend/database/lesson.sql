BEGIN;

DROP TABLE IF EXISTS lesson CASCADE;

CREATE TABLE IF NOT EXISTS lms.lesson (
    -- unique identifier that auto increments for each lesson
    id                  BIGSERIAL PRIMARY KEY,
    -- FK ref to the course this lesson belongs to, its to make sure if the course gets deleted, the lessons are also deleted
    course_id           BIGINT NOT NULL REFERENCES lms.course(id) ON DELETE CASCADE,
    lesson_number       INT NOT NULL CHECK (lesson_number > 0),
    title               TEXT NOT NULL,
    content_url         TEXT,
    duration_minutes    INT CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    -- each course cannot have duplicate lesson numbers
    UNIQUE(course_id, lesson_number)
    );

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT c.id, 1, 'Introduction to Software Engineering', 90
FROM lms.course c WHERE c.title='Software Engineering'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT c.id, 2, 'Software Quality Attributes', 90
FROM lms.course c WHERE c.title='Software Engineering'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT c.id, 3, 'What are Frameworks?', 90
FROM lms.course c WHERE c.title='Software Engineering'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 4, 'Agile & Scrum', 80
FROM lms.course WHERE title='Software Engineering'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT c.id, 1, 'Introduction to SQL', 60
FROM lms.course c WHERE c.title='Databases'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'ER Models & Normalization', 70
FROM lms.course WHERE title='Databases'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'SQL Joins & Queries', 80
FROM lms.course WHERE title='Databases'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'Big-O Notation', 60
FROM lms.course WHERE title='Algorithms'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'Graph Algorithms', 100
FROM lms.course WHERE title='Algorithms'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Heapsort, Quicksort, Counting Sort and Radix Sort', 100
FROM lms.course WHERE title='Algorithms'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 4, 'Topological Sort', 100
FROM lms.course WHERE title='Algorithms'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'HTML & CSS Basics', 90
FROM lms.course WHERE title='Web Development'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'JavaScript & DOM', 90
FROM lms.course WHERE title='Web Development'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Difference with Frontend and Backend', 90
FROM lms.course WHERE title='Web Development'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 4, 'UI and UX', 90
FROM lms.course WHERE title='Web Development'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'Introduction to AI', 80
FROM lms.course WHERE title='AI Basics'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'Neural Networks Overview', 110
FROM lms.course WHERE title='AI Basics'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Machine Learning', 110
FROM lms.course WHERE title='AI Basics'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'Introduction to Data Science', 75
FROM lms.course WHERE title='Data Science'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'Machine Learning for Data Science', 90
FROM lms.course WHERE title='Data Science'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Data Visualisation & Communication', 100
FROM lms.course WHERE title='Data Science'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'Introduction to Operating Systems Concepts', 70
FROM lms.course WHERE title='Operating Systems'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'Process Management', 90
FROM lms.course WHERE title='Operating Systems'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Memory Management - Early Systems', 100
FROM lms.course WHERE title='Operating Systems'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 4, 'Memory Management - Virtual Memory', 110
FROM lms.course WHERE title='Operating Systems'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'Introduction to Software Quality and Testing', 70
FROM lms.course WHERE title='Software Testing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'Defining and Measuring Quality', 80
FROM lms.course WHERE title='Software Testing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Testing From the Outside', 90
FROM lms.course WHERE title='Software Testing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'Introduction to Cloud Computing', 70
FROM lms.course WHERE title='Cloud Computing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'Cloud Platforms and Services', 90
FROM lms.course WHERE title='Cloud Computing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Cloud Architecture and Design', 90
FROM lms.course WHERE title='Cloud Computing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 4, 'Networking in Cloud Environments', 100
FROM lms.course WHERE title='Cloud Computing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 5, 'Cloud Security', 120
FROM lms.course WHERE title='Cloud Computing'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 1, 'Introduction to Cybersecurity', 80
FROM lms.course WHERE title='Cybersecurity'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 2, 'Cryptography Basics', 90
FROM lms.course WHERE title='Cybersecurity'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 3, 'Internet of Things Security', 100
FROM lms.course WHERE title='Cybersecurity'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 4, 'Mobile and Web Application Security', 100
FROM lms.course WHERE title='Cybersecurity'
    ON CONFLICT DO NOTHING;

INSERT INTO lms.lesson (course_id, lesson_number, title, duration_minutes)
SELECT id, 5, 'Threats & Vulnerabilities', 90
FROM lms.course WHERE title='Cybersecurity'
    ON CONFLICT DO NOTHING;

COMMIT;
