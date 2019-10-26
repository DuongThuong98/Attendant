/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50505
Source Host           : localhost:3306
Source Database       : qldd

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2017-05-08 13:11:13
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for absence_requests
-- ----------------------------
DROP TABLE IF EXISTS `absence_requests`;
CREATE TABLE `absence_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for attendance
-- ----------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `student_count` tinyint(1) DEFAULT 0,
  `teacher_checkin` datetime DEFAULT NULL,
  `teacher_checkout` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `validated_by` int(11) DEFAULT NULL,
  `validation_time` datetime DEFAULT NULL,
  `addition_info` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  `closed` boolean DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for attendance_detail
-- ----------------------------
DROP TABLE IF EXISTS `attendance_detail`;
CREATE TABLE `attendance_detail` (
  `attendance_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attendance_time` datetime DEFAULT NULL,
  `attendance_type` tinyint(1) NOT NULL DEFAULT '0',
  `edited_by` int(11) DEFAULT NULL,
  `edited_reason` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`attendance_id`,`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for classes
-- ----------------------------
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT 'missing class name',
  `email` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for courses
-- ----------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `semester_id` tinyint(1) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `note` varchar(255) NULL,
  `office_hour` varchar(50) NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for feedbacks
-- ----------------------------
DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_id` int(11) DEFAULT NULL,
  `to_id` int(11) DEFAULT NULL,
  `title` varchar(50) CHARACTER SET utf8 NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `type` tinyint(1) DEFAULT 0,
  `read` boolean DEFAULT FALSE,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `time` datetime DEFAULT CURRENT_TIMESTAMP,
  `object_id` int(11) DEFAULT NULL,
  `object_type` tinyint(1) DEFAULT NULL,
  `user_action` tinyint(1) DEFAULT NULL,
  `field` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `old_value` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `new_value` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for programs
-- ----------------------------
DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'missing program name',
  `code` varchar(10) COLLATE utf8_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT 'role name',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for semesters
-- ----------------------------
DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters` (
  `id` int(11)  NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT '???',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `vacation_time` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for students
-- ----------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `stud_id` varchar(10) CHARACTER SET utf8 NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `current_courses` tinyint(1) DEFAULT '0',
  `note` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for student_enroll_course
-- ----------------------------
DROP TABLE IF EXISTS `student_enroll_course`;
CREATE TABLE `student_enroll_course` (
  `class_has_course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attendance_status` tinyint(1) DEFAULT '0',
  `enrollment_status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`class_has_course_id`,`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for teachers
-- ----------------------------
DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `current_courses` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for teacher_teach_course
-- ----------------------------
DROP TABLE IF EXISTS `teacher_teach_course`;
CREATE TABLE `teacher_teach_course` (
  `teacher_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_role` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`teacher_id`,`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `last_name` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `first_name` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `phone` varchar(12) CHARACTER SET utf8 DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for votes
-- ----------------------------
DROP TABLE IF EXISTS `votes`;
CREATE TABLE `votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `rate` tinyint(1) DEFAULT NULL,
  `note` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for class_has_course
-- ----------------------------
DROP TABLE IF EXISTS `class_has_course`;
CREATE TABLE `class_has_course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `total_stud` tinyint(1) NOT NULL DEFAULT '0',
  `attendance_count` tinyint(1) NOT NULL DEFAULT '0',
  `schedules` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`,`class_id`,`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for quiz
-- ----------------------------
DROP TABLE IF EXISTS `quiz`;
CREATE TABLE `quiz` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `class_has_course_id` int(11) NOT NULL,
  `closed` boolean DEFAULT FALSE,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `is_use_timer` boolean DEFAULT TRUE,
  `timer` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `code` varchar(7) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`,`class_has_course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `text` text NOT NULL,
  PRIMARY KEY (`id`,`quiz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for answers
-- ----------------------------
DROP TABLE IF EXISTS `quiz_answers`;
CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_question_id` int(11) NOT NULL,
  `answered_by` int(11) NOT NULL,
  `text` text DEFAULT NULL,
  `answered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`quiz_question_id`,`answered_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `to_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `object_id` int(11) NOT NULL,
  `object_type` tinyint(1) DEFAULT NULL,
  `read` boolean DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


-- ----------------------------
-- Trigger for insert user to create teacher
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_insert_user_create_teacher//
CREATE TRIGGER trigger_insert_user_create_teacher
    AFTER INSERT ON users
    FOR EACH ROW
BEGIN
	IF NEW.role_id = 2 THEN
		INSERT INTO teachers SET id = NEW.id;
	END IF;
END//
DELIMITER ;

-- ----------------------------
-- Trigger for delete teacher current courses
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_delete_teacher_teach_course//
CREATE TRIGGER trigger_delete_teacher_teach_course
    AFTER DELETE ON teacher_teach_course
    FOR EACH ROW
BEGIN
    UPDATE teachers
	SET current_courses = current_courses - 1
	WHERE id = OLD.teacher_id;
END//
DELIMITER ;

-- ----------------------------
-- Trigger for insert teacher current courses
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_insert_teacher_teach_course//
CREATE TRIGGER trigger_insert_teacher_teach_course
    AFTER INSERT ON teacher_teach_course
    FOR EACH ROW
BEGIN
    UPDATE teachers
	SET current_courses = current_courses + 1
	WHERE id = NEW.teacher_id;
END//
DELIMITER ;

-- ----------------------------
-- Trigger for update teacher current courses
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_update_teacher_teach_course//
CREATE TRIGGER trigger_update_teacher_teach_course
    AFTER UPDATE ON teacher_teach_course
    FOR EACH ROW
BEGIN
    IF NEW.teacher_id <> OLD.teacher_id THEN
		UPDATE teacher
		SET current_courses = current_courses + 1
		WHERE id = NEW.teacher_id;

		UPDATE teacher
		SET current_courses = current_courses - 1
		WHERE id = OLD.teacher_id;
	END IF;
END//
DELIMITER ;




-- ----------------------------
-- Trigger for delete student current courses
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_delete_student_enroll_course//
CREATE TRIGGER trigger_delete_student_enroll_course
    AFTER DELETE ON student_enroll_course
    FOR EACH ROW
BEGIN
    UPDATE students
	SET current_courses = current_courses - 1
	WHERE id = OLD.student_id;
	UPDATE class_has_course
	SET total_stud = total_stud - 1
	WHERE id =  OLD.class_has_course_id;
END//
DELIMITER ;

-- ----------------------------
-- Trigger for insert student current courses
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_insert_student_enroll_course//
CREATE TRIGGER trigger_insert_student_enroll_course
    AFTER INSERT ON student_enroll_course
    FOR EACH ROW
BEGIN
    UPDATE students
	SET current_courses = current_courses + 1
	WHERE id = NEW.student_id;
	UPDATE class_has_course
	SET total_stud = total_stud + 1
	WHERE id = NEW.class_has_course_id;
END//
DELIMITER ;

-- ----------------------------
-- Trigger for update course attendance count
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_insert_attendance//
CREATE TRIGGER trigger_insert_attendance
    AFTER INSERT ON attendance
    FOR EACH ROW
BEGIN
    UPDATE class_has_course
	SET attendance_count = attendance_count + 1
	WHERE course_id = NEW.course_id AND class_id = NEW.class_id;
END//
DELIMITER ;

-- ----------------------------
-- Trigger for update course attendance count
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_delete_attendance//
CREATE TRIGGER trigger_delete_attendance
    BEFORE DELETE ON attendance
    FOR EACH ROW
BEGIN
  UPDATE class_has_course
  SET attendance_count = attendance_count - 1
  WHERE course_id = OLD.course_id AND  class_id = OLD.class_id;

  DELETE FROM attendance_detail
  WHERE attendance_id = OLD.id;
END//
DELIMITER ;


-- ----------------------------
-- Trigger for update attendance's student count
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_update_attendance_detail//
CREATE TRIGGER trigger_update_attendance_detail
    AFTER UPDATE ON attendance_detail
    FOR EACH ROW
BEGIN
  IF NEW.attendance_type = 1 AND OLD.attendance_type = 0 THEN
    UPDATE attendance
    SET student_count = student_count + 1
    WHERE id = NEW.attendance_id;
  END IF;
  IF NEW.attendance_type = 0 AND OLD.attendance_type = 1 THEN
    UPDATE attendance
    SET student_count = student_count - 1
    WHERE id = NEW.attendance_id;
  END IF;
END//
DELIMITER ;

-- ----------------------------
-- Trigger for insert attendance_detail
-- ----------------------------
DELIMITER //
DROP TRIGGER IF EXISTS trigger_insert_attendance_detail//
CREATE TRIGGER trigger_insert_attendance_detail
    AFTER INSERT ON attendance_detail
    FOR EACH ROW
BEGIN
  IF NEW.attendance_type = 1 THEN
    UPDATE attendance
    SET student_count = student_count + 1
    WHERE id = NEW.attendance_id;
  END IF;
END//
DELIMITER ;

-- DELIMITER //
-- DROP TRIGGER IF EXISTS trigger_delete_attendance_detail//
-- CREATE TRIGGER trigger_delete_attendance_detail
--     AFTER DELETE ON attendance_detail
--     FOR EACH ROW
-- BEGIN
--     UPDATE attendance
--   SET student_count = student_count - 1
--   WHERE id = OLD.attendance_id;
-- END//
-- DELIMITER ;
