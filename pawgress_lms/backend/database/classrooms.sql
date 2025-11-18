
DROP TABLE IF EXISTS classrooms CASCADE;

CREATE TABLE IF NOT EXISTS lms.classroom (
    classroom_id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lesson_id                 BIGINT NOT NULL REFERENCES lms.lesson(id) ON DELETE CASCADE,
    course_id                 BIGINT NOT NULL REFERENCES lms.course(id) ON DELETE CASCADE,
    teacher_id                INT NOT NULL REFERENCES users(users_ID) ON DELETE CASCADE,
    class_start_date          DATE NOT NULL,
    class_start_time          TIME NOT NULL,
    class_end_date            DATE NOT NULL,
    class_end_time            TIME NOT NULL,
    frequency                 SMALLINT NOT NULL DEFAULT 1 CHECK (frequency >= 1),
    duration_weeks            SMALLINT NOT NULL DEFAULT 2,
    classroom_location        VARCHAR(150),
    capacity                  SMALLINT NOT NULL DEFAULT 20 CHECK (capacity <= 20),
    classroom_status          VARCHAR(10) NOT NULL CHECK (classroom_status IN ('scheduled','occupied','cancelled')),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(), -- for the report
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),  -- for the report
    CHECK ((class_end_date + class_end_time) > (class_start_date + class_start_time))
);

INSERT INTO lms.classroom (lesson_id, course_id, teacher_id, class_start_date, class_start_time, class_end_date, class_end_time, frequency, duration_weeks, capacity, classroom_location, classroom_status)
VALUES

(1, 1, 1, '2025-09-15', '09:00', '2025-09-29', '11:00', 1, 2, 20, 'Building A, Room 101', 'scheduled'),  -- Software Engineering, Lesson 1
(2, 1, 2, '2025-09-16', '14:00', '2025-10-14', '16:00', 1, 4, 18, 'Building B, Room 202', 'scheduled'),  -- Software Engineering, Lesson 2
(5, 2, 3, '2025-09-20', '10:00', '2025-10-04', '12:00', 1, 2, 15, 'Online - Zoom', 'scheduled'),  -- Databases, Lesson 1
(8, 3, 1, '2025-09-22', '13:00', '2025-10-06', '15:00', 1, 2, 20, 'Building C, Room 303', 'scheduled');  -- Algorithms, Lesson 1

SELECT * FROM lms.classroom;


