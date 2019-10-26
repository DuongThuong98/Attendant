// Authenticate

/**
* @swagger
* tags:
*   name: Auth
*   description: Authenticate
*/

/**
 * @swagger
 * /authenticate/login:
 *   post:
 *     summary: login and retrieve token
 *     description:
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: user ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: user password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: json
 */

/**
 * @swagger
 * /authenticate/logout:
 *   post:
 *     summary: logout
 *     description:
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: formData
 *         required: true
 *         type: string
 *       - name: user_id
 *         description: user id
 *         in: formData
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: json
 */

//Teacher

/**
* @swagger
* tags:
*   name: Teacher
*   description: Teacher management
*/

/**
* @swagger
* /api/teacher/update:
*   put:
*     summary: Update teacher info
*     description:
*     tags: [Teacher]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: id
*         description: user id
*         in: formData
*         required: true
*         type: integer
*       - name: name
*         description: name
*         in: formData
*         required: true
*         type: string
*       - name: email
*         description: email
*         in: formData
*         required: true
*         type: string
*       - name: phone
*         description: phone
*         in: formData
*         required: true
*         type: string
*       - name: avatar
*         description: avatar
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/


// Student

/**
* @swagger
* tags:
*   name: Student
*   description: Student data
*/

/**
* @swagger
* /api/student/update:
*   post:
*     summary: Update student info
*     description:
*     tags: [Student]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: id
*         description: user id
*         in: formData
*         required: true
*         type: integer
*       - name: name
*         description: name
*         in: formData
*         required: true
*         type: string
*       - name: email
*         description: email
*         in: formData
*         required: true
*         type: string
*       - name: phone
*         description: phone
*         in: formData
*         required: true
*         type: string
*       - name: avatar
*         description: avatar
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/check-attendance-list:
*   post:
*     summary: Get students of course
*     description:
*     tags: [Student]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: class_id
*         description: class id
*         in: formData
*         required: true
*         type: integer
*       - name: course_id
*         description: course id
*         in: formData
*         required: true
*         type: integer
*       - name: islistOnly
*         description: islistOnly
*         in: formData
*         type: integer
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/check-attendance:
*   post:
*     summary: Get students of course
*     description:
*     tags: [Student]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: attendance_id
*         description: attendance id
*         in: formData
*         required: true
*         type: integer
*     responses:
*       200:
*         description: json
*/

// Course

/**
* @swagger
* tags:
*   name: Course
*   description: Course data
*/

/**
* @swagger
* /api/course/teaching:
*   post:
*     summary: Get Course list
*     description:
*     tags: [Course]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/course/studying:
*   post:
*     summary: Get Course list
*     description:
*     tags: [Course]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/

// Attendance

/**
* @swagger
* tags:
*   name: Attendance
*   description: Attendance management
*/

/**
* @swagger
* /api/attendance/list-by-student:
*   post:
*     summary: Get student
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*       - name: student_id
*         description: student id
*         in: formData
*         required: true
*         type: integer
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/opening-by-teacher:
*   post:
*     summary: Get opening attendance
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*       - name: teacher_id
*         description: teacher id
*         in: formData
*         required: true
*         type: integer
*       - name: isMobile
*         description: mobile reduce data
*         in: formData
*         type: integer
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/opening-for-student:
*   post:
*     summary: Get opening attendance
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/create:
*   post:
*     summary: request an attendance id from server
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*       - name: course_id
*         description: courses id
*         in: formData
*         required: true
*         type: integer
*       - name: class_id
*         description: class id
*         in: formData
*         required: true
*         type: integer
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/delete:
*   post:
*     summary: delete an attendance
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*       - name: attendance_id
*         description: attend id
*         in: formData
*         required: true
*         type: integer
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/close:
*   post:
*     summary: delete an attendance
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*       - name: attendance_id
*         description: attend id
*         in: formData
*         required: true
*         type: integer
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/update-attendance:
*   post:
*     summary: Update student attendance type
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: attendance_id
*         description: attendance id
*         in: formData
*         required: true
*         type: integer
*       - name: data
*         description: attendance detail
*         in: formData
*         required: true
*         type: array
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/attendance/check-delegate-code:
*   post:
*     summary: Check delegate code
*     description:
*     tags: [Attendance]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: formData
*         required: true
*         type: string
*       - name: code
*         description: code
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* tags:
*   name: Feedback
*   description: Feedback management
*/

/**
* @swagger
* /api/feedback/send:
*   post:
*     summary: Send feedback
*     description:
*     tags: [Feedback]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: title
*         description: title
*         in: formData
*         required: true
*         type: string
*       - name: content
*         description: content
*         in: formData
*         required: true
*         type: string
*       - name: isAnonymous
*         description: isAnonymous (only use for student)
*         in: formData
*         type: boolean
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* /api/feedback/history:
*   post:
*     summary: Sent Feedback List
*     description:
*     tags: [Feedback]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* tags:
*   name: AbsenceRequest
*   description: AbsenceRequest management
*/

/**
* @swagger
* /api/absence-request/by-student:
*   post:
*     summary: Send feedback
*     description:
*     tags: [AbsenceRequest]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: id
*         description: student id
*         in: formData
*         required: true
*         type: integer
*     responses:
*       200:
*         description: json
*/

/**
* @swagger
* tags:
*   name: Quiz
*   description: Quiz management
*/

/**
* @swagger
* /api/quiz/published:
*   post:
*     summary: Quiz detail
*     description:
*     tags: [Quiz]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: quiz_code
*         description: quiz code
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/


/**
* @swagger
* /api/quiz/join:
*   post:
*     summary: check quiz code
*     description:
*     tags: [Quiz]
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: user token
*         in: formData
*         required: true
*         type: string
*       - name: code
*         description: quiz code
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: json
*/