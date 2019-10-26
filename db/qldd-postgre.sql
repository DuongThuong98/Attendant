SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET default_tablespace = '';
SET default_with_oids = false;

-- ----------------------------
-- Table structure for absence_requests
-- ----------------------------
DROP TABLE IF EXISTS absence_requests;
CREATE TABLE absence_requests (
  id serial NOT NULL,
  student_id int NOT NULL,
  reason varchar(255) DEFAULT NULL,
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL,
  status smallint NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for attendance
-- ----------------------------
DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
  id serial NOT NULL,
  course_id int DEFAULT NULL,
  class_id int DEFAULT NULL,
  time timestamp with time zone DEFAULT NULL,
  student_count smallint DEFAULT 0,
  teacher_checkin timestamp with time zone DEFAULT NULL,
  teacher_checkout timestamp with time zone DEFAULT NULL,
  created_by int DEFAULT NULL,
  validated_by int DEFAULT NULL,
  validation_time timestamp with time zone DEFAULT NULL,
  addition_info varchar(50) DEFAULT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  closed boolean DEFAULT FALSE,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for attendance_detail
-- ----------------------------
DROP TABLE IF EXISTS attendance_detail;
CREATE TABLE attendance_detail (
  attendance_id int NOT NULL,
  student_id int NOT NULL,  
  answered_questions smallint DEFAULT '0',
  discussions smallint DEFAULT '0',
  presentations smallint DEFAULT '0',
  attendance_time timestamp with time zone DEFAULT NULL,
  attendance_type smallint NOT NULL DEFAULT '0',
  edited_by int DEFAULT NULL,
  edited_reason varchar(255) DEFAULT NULL,
  PRIMARY KEY (attendance_id,student_id)
);

-- ----------------------------
-- Table structure for classes
-- ----------------------------
DROP TABLE IF EXISTS classes;
CREATE TABLE classes (
  id serial NOT NULL,
  name varchar(50) NOT NULL DEFAULT 'missing class name',
  email varchar(50) DEFAULT NULL,
  program_id int DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for courses
-- ----------------------------
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
  id serial NOT NULL,
  code varchar(10) NOT NULL DEFAULT '',
  name varchar(255) NOT NULL DEFAULT '',
  semester_id smallint DEFAULT NULL,
  program_id int DEFAULT NULL,
  note varchar(255) NULL,
  office_hour varchar(50) NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for feedbacks
-- ----------------------------
DROP TABLE IF EXISTS feedbacks;
CREATE TABLE feedbacks (
  id serial NOT NULL,
  from_id int DEFAULT NULL,
  to_id int DEFAULT NULL,
  title varchar(50) NOT NULL,
  content varchar(255) DEFAULT NULL,
  category smallint DEFAULT 0,
  type smallint DEFAULT 0,
  read boolean DEFAULT FALSE,
  replied boolean DEFAULT FALSE,
  replied_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS log;
CREATE TABLE log (
  id serial NOT NULL,
  user_id int NOT NULL,
  time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  object_id int DEFAULT NULL,
  object_type smallint DEFAULT NULL,
  user_action smallint DEFAULT NULL,
  field varchar(50) DEFAULT NULL,
  old_value varchar(50) DEFAULT NULL,
  new_value varchar(50) DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for programs
-- ----------------------------
DROP TABLE IF EXISTS programs;
CREATE TABLE programs (
  id serial NOT NULL,
  name varchar(50) NOT NULL DEFAULT 'missing program name',
  code varchar(10) DEFAULT '',
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id serial NOT NULL,
  name varchar(50) NOT NULL DEFAULT 'role name',
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for semesters
-- ----------------------------
DROP TABLE IF EXISTS semesters;
CREATE TABLE semesters (
  id serial NOT NULL,
  name varchar(50) NOT NULL DEFAULT '???',
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL,
  vacation_time varchar(50) DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for students
-- ----------------------------
DROP TABLE IF EXISTS students;
CREATE TABLE students (
  id int NOT NULL,
  stud_id varchar(10) NOT NULL,
  class_id int DEFAULT NULL,
  status smallint DEFAULT '0',
  current_courses smallint DEFAULT '0',
  note varchar(50) DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for student_enroll_course
-- ----------------------------
DROP TABLE IF EXISTS student_enroll_course;
CREATE TABLE student_enroll_course (
  class_has_course_id int NOT NULL,
  student_id int NOT NULL,
  attendance_status smallint DEFAULT '0',
  enrollment_status smallint DEFAULT '0',
  PRIMARY KEY (class_has_course_id,student_id)
);

-- ----------------------------
-- Table structure for teachers
-- ----------------------------
DROP TABLE IF EXISTS teachers;
CREATE TABLE teachers (
  id int NOT NULL,
  current_courses smallint DEFAULT '0',
  total_courses smallint DEFAULT '0',
  average_attendance smallint DEFAULT '0',
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for teacher_teach_course
-- ----------------------------
DROP TABLE IF EXISTS teacher_teach_course;
CREATE TABLE teacher_teach_course (
  teacher_id int NOT NULL,
  course_id int NOT NULL,
  teacher_role smallint NOT NULL DEFAULT '0',
  PRIMARY KEY (teacher_id,course_id)
);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id serial NOT NULL,
  last_name varchar(50) DEFAULT NULL,
  first_name varchar(50) DEFAULT NULL,
  email varchar(50) DEFAULT NULL,
  phone varchar(12) DEFAULT NULL,
  password varchar(255) DEFAULT NULL,
  role_id smallint DEFAULT NULL,
  avatar varchar(255) DEFAULT 'http://i.imgur.com/FTa2JWD.png',
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for votes
-- ----------------------------
DROP TABLE IF EXISTS votes;
CREATE TABLE votes (
  id serial NOT NULL,
  student_id int DEFAULT NULL,
  teacher_id int DEFAULT NULL,
  course_id int DEFAULT NULL,
  rate smallint DEFAULT NULL,
  note varchar(50) DEFAULT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ----------------------------
-- Table structure for class_has_course
-- ----------------------------
DROP TABLE IF EXISTS class_has_course;
CREATE TABLE class_has_course (
  id serial NOT NULL,
  class_id int NOT NULL,
  course_id int NOT NULL,
  total_stud smallint NOT NULL DEFAULT '0',
  attendance_count smallint NOT NULL DEFAULT '0',
  schedules varchar(255) DEFAULT NULL,
  PRIMARY KEY (id,class_id,course_id)
);

-- ----------------------------
-- Table structure for quiz
-- ----------------------------
DROP TABLE IF EXISTS quiz;
CREATE TABLE quiz (
  id serial NOT NULL,
  title varchar(255) DEFAULT NULL,
  class_has_course_id int NOT NULL,
  -- closed boolean DEFAULT FALSE,
  created_by int DEFAULT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  started_at timestamp with time zone DEFAULT NULL,
  is_randomize_answers boolean DEFAULT TRUE,
  is_randomize_questions boolean DEFAULT TRUE,
  required_correct_answers int DEFAULT 0,
  is_template boolean DEFAULT FALSE,
  code varchar(7) DEFAULT NULL,
  type smallint DEFAULT NULL,
  PRIMARY KEY (id,class_has_course_id)
);

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS quiz_questions;
CREATE TABLE quiz_questions (
  id serial NOT NULL,
  quiz_id int NOT NULL,
  text text NOT NULL,
  option_a varchar(255) DEFAULT NULL,
  option_b varchar(255) DEFAULT NULL,
  option_c varchar(255) DEFAULT NULL,
  option_d varchar(255) DEFAULT NULL,
  correct_option varchar(255) DEFAULT NULL,
  timer int DEFAULT NULL,
  PRIMARY KEY (id,quiz_id)
);

-- ----------------------------
-- Table structure for answers
-- ----------------------------
DROP TABLE IF EXISTS quiz_answers;
CREATE TABLE quiz_answers (
  id serial NOT NULL,
  quiz_question_id int NOT NULL,
  answered_by int NOT NULL,
  selected_option varchar(1) DEFAULT NULL,
  answered_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id,quiz_question_id,answered_by)
);

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id serial NOT NULL,
  to_id int DEFAULT NULL,
  from_id int DEFAULT NULL,
  message text DEFAULT NULL,
  object_id int NOT NULL,
  type smallint DEFAULT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION update_updated_at()
 	RETURNS trigger AS
	$$
	BEGIN
	 	NEW.updated_at = now();
    	RETURN NEW;	
	END;
	$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE  update_updated_at();

CREATE TRIGGER update_course_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE  update_updated_at();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE  update_updated_at();

CREATE TRIGGER update_absence_request_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE  update_updated_at();
-- ----------------------------
-- Trigger for insert user to create teacher
-- ----------------------------
CREATE OR REPLACE FUNCTION insert_teacher()
 	RETURNS trigger AS
	$$
	BEGIN
	 	IF NEW.role_id = 2 THEN
			INSERT INTO teachers (id) VALUES (NEW.id);
		END IF;
	 	RETURN NEW;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_insert_user_create_teacher
    AFTER INSERT ON users
    FOR EACH ROW
	EXECUTE PROCEDURE insert_teacher();

-- ----------------------------
-- Trigger for delete teacher current courses
-- ----------------------------
CREATE OR REPLACE FUNCTION update_current_course_when_del_teacher()
 	RETURNS trigger AS
	$$
	BEGIN
		UPDATE teachers
		SET current_courses = current_courses - 1
		WHERE id = OLD.teacher_id;
	 	RETURN OLD;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_teacher_teach_course
    AFTER DELETE ON teacher_teach_course
    FOR EACH ROW
	EXECUTE PROCEDURE update_current_course_when_del_teacher();

-- ----------------------------
-- Trigger for insert teacher current courses
-- ----------------------------
CREATE OR REPLACE FUNCTION update_current_course_when_insert_teacher()
 	RETURNS trigger AS
	$$
	BEGIN
		UPDATE teachers
		SET current_courses = current_courses + 1
		WHERE id = NEW.teacher_id;
	 	RETURN NEW;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_insert_teacher_teach_course
    AFTER INSERT ON teacher_teach_course
    FOR EACH ROW
	EXECUTE PROCEDURE update_current_course_when_insert_teacher();

-- ----------------------------
-- Trigger for update teacher current courses
-- ----------------------------
CREATE OR REPLACE FUNCTION update_current_course()
 	RETURNS trigger AS
	$$
	BEGIN
		IF NEW.teacher_id <> OLD.teacher_id THEN
			UPDATE teacher
			SET current_courses = current_courses + 1
			WHERE id = NEW.teacher_id;

			UPDATE teacher
			SET current_courses = current_courses - 1
			WHERE id = OLD.teacher_id;
		END IF;
		RETURN NEW;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_update_teacher_teach_course
    AFTER UPDATE ON teacher_teach_course
    FOR EACH ROW
	EXECUTE PROCEDURE update_current_course();

-- ----------------------------
-- Trigger for delete student current courses
-- ----------------------------
CREATE OR REPLACE FUNCTION when_delete_student_enroll_course()
 	RETURNS trigger AS
	$$
	BEGIN
		UPDATE students
		SET current_courses = current_courses - 1
		WHERE id = OLD.student_id;
		UPDATE class_has_course
		SET total_stud = total_stud - 1
		WHERE id =  OLD.class_has_course_id;
		RETURN OLD;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_student_enroll_course
    AFTER DELETE ON student_enroll_course
    FOR EACH ROW
	EXECUTE PROCEDURE when_delete_student_enroll_course();

-- ----------------------------
-- Trigger for insert student current courses
-- ----------------------------
CREATE OR REPLACE FUNCTION when_insert_student_enroll_course()
 	RETURNS trigger AS
	$$
	BEGIN
		UPDATE students
		SET current_courses = current_courses + 1
		WHERE id = NEW.student_id;
		UPDATE class_has_course
		SET total_stud = total_stud + 1
		WHERE id = NEW.class_has_course_id;
		RETURN NEW;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_insert_student_enroll_course
    AFTER INSERT ON student_enroll_course
    FOR EACH ROW
	EXECUTE PROCEDURE when_insert_student_enroll_course();

-- ----------------------------
-- Trigger for update course attendance count
-- ----------------------------
CREATE OR REPLACE FUNCTION when_insert_attendance()
 	RETURNS trigger AS
	$$
	BEGIN
		UPDATE class_has_course
		SET attendance_count = attendance_count + 1
		WHERE course_id = NEW.course_id AND class_id = NEW.class_id;
		RETURN NEW;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_insert_attendance
    AFTER INSERT ON attendance
    FOR EACH ROW
	EXECUTE PROCEDURE when_insert_attendance();

-- ----------------------------
-- Trigger for update course attendance count
-- ----------------------------
CREATE OR REPLACE FUNCTION when_delete_attendance()
 	RETURNS trigger AS
	$$
	BEGIN
		UPDATE class_has_course
		SET attendance_count = attendance_count - 1
		WHERE course_id = OLD.course_id AND  class_id = OLD.class_id;

		DELETE FROM attendance_detail
		WHERE attendance_id = OLD.id;
		RETURN OLD;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_attendance
    BEFORE DELETE ON attendance
    FOR EACH ROW
	EXECUTE PROCEDURE when_delete_attendance();


-- ----------------------------
-- Trigger for update attendance's student count
-- ----------------------------
CREATE OR REPLACE FUNCTION when_update_attendance_detail()
 	RETURNS trigger AS
	$$
	BEGIN
		IF NEW.attendance_type != 0 AND OLD.attendance_type = 0 THEN
		UPDATE attendance
		SET student_count = student_count + 1
		WHERE id = NEW.attendance_id;
		END IF;
		IF NEW.attendance_type = 0 AND OLD.attendance_type != 0 THEN
		UPDATE attendance
		SET student_count = student_count - 1
		WHERE id = NEW.attendance_id;
		END IF;
		RETURN NEW;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_update_attendance_detail
    AFTER UPDATE ON attendance_detail
    FOR EACH ROW
	EXECUTE PROCEDURE when_update_attendance_detail();

-- ----------------------------
-- Trigger for insert attendance_detail
-- ----------------------------
CREATE OR REPLACE FUNCTION when_insert_attendance_detail()
 	RETURNS trigger AS
	$$
	BEGIN
		IF NEW.attendance_type != 0 THEN
		UPDATE attendance
		SET student_count = student_count + 1
		WHERE id = NEW.attendance_id;
		END IF;
		RETURN NEW;
	END;
	$$ language 'plpgsql';

CREATE TRIGGER trigger_insert_attendance_detail
    AFTER INSERT ON attendance_detail
    FOR EACH ROW
	EXECUTE PROCEDURE when_insert_attendance_detail();

