BEGIN;

CREATE SCHEMA IF NOT EXISTS lms;

DROP TABLE IF EXISTS course CASCADE;

CREATE TABLE IF NOT EXISTS lms.course (
    -- unique identifier that auto increments for each course
    id              BIGSERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    total_credits   INT DEFAULT 0,
    duration        TEXT DEFAULT '4_weeks',
    status          TEXT DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


INSERT INTO lms.course (title, description, total_credits, duration, status)
VALUES
    ('Software Engineering', 'LMS project', 12, '4_weeks', 'draft'),
    ('Databases', 'Relational modeling & SQL', 6, '3_weeks', 'published'),
    ('Algorithms', 'Complexity, sorting, graphs', 9, '4_weeks', 'published'),
    ('Web Development', 'Frontend and backend integration', 8, '3_weeks', 'draft'),
    ('AI Basics', 'Intro to machine learning and neural nets', 10, '4_weeks', 'published'),
    ('Data Science', 'Scientific methods, processes, and systems', 6, '2_weeks', 'draft'),
    ('Operating Systems', 'Processes, threads, memory, scheduling', 8, '3_weeks', 'draft'),
    ('Software Testing', 'Unit, integration, and system testing', 5, '2_weeks', 'published'),
    ('Cloud Computing', 'Cloud models, Docker, Kubernetes', 7, '3_weeks', 'draft'),
    ('Cybersecurity', 'Encryption, threats, and secure systems', 9, '4_weeks', 'published')
    ON CONFLICT DO NOTHING;

COMMIT;
