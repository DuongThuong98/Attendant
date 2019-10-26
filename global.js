var fs = require('fs');
var nodemailer = require('nodemailer');

module.exports = {
    db: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'qldd'
    },
    db_postgres: {
        host: 'ec2-23-23-216-40.compute-1.amazonaws.com',
        user: 'cjgmzlabuhqtfi',
        password: 'd622e3da2a297c8ace6627c86463b44033c60f0c501ab16a545521d0b23cacf3',
        port:'5432',
        database: 'depna5rf8ertn0'
    },
    //db_postgres: {
    //    host: 'localhost',
    //    user: 'postgres',
    //    password: 'a',
    //    port:'5432',
    //    database: 'qldd'
    //},
    host: 'https://tpltesting.herokuapp.com',
    email_setting: {
        host: 'smtp.office365.com', // Office 365 server
        port: 587, // secure SMTP
        secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        auth: {
            user: '1412572@student.hcmus.edu.vn',
            pass: 'Vietnam2015'
        },
        tls: {
            ciphers: 'SSLv3'
        }
    },
    notification_type:{
        send_feedback:0,
        reply_feedback:1,
        send_absence_request:2,
        accept_absence_request:3,
        reject_absence_request:4,
        open_attendance:5,
        request_to_be_check_attendance:6,
    },
    attendance_type:{
        permited_absent: -1,
        absent: 0,
        checklist: 1,
        qr: 2,
        quiz: 3,
        face: 4,
    },
    quiz_type:{
        academic: 0,
        miscellaneous: 1,
    },
    attendance_status:{
        normal: 0,
        exemption: 1,
    },
    feedback_status:{
        pending: 0,
        replied: 1,
    },
    feedback_categories:{
        all: 0,
        academic: 1,
        facility: 2,
    },
    role: {
        admin: 4,
        student: 1,
        teacher: 2,
        staff: 3,
    },
    absence_request_status: {
        new: 0,
        accepted: 1,
        rejected: 2
    },
    student_interaction_type:{
        answer_question: 0,
        discuss: 1,
        present: 2
    },
    jwt_secret_key: '13530191353049',
    jwt_expire_time: '1d',
    jwt_reset_password_expire_time: 30 * 60,
    jwt_register_expire_time: '7d',
    default_page: 1,
    default_limit: 10,

    lecturer_role: 0,
    ta_role: 1,

    api_ver: 1,

    sendError: function(res, detail = null, message = "Server error") {
        res.send({ result: 'failure', detail: detail, message: message });
    },

    filterListByPage: function(page, limit, list) {
        var result = [];
        var length = list.length;
        if (length < limit) {
            return list;
        } else {
            if (page * limit > length) {
                for (var i = (page - 1) * limit; i < length; i++) {
                    result.push(list[i]);
                }
            } else {
                for (var i = (page - 1) * limit; i < page * limit; i++) {
                    result.push(list[i]);
                }
            }
            return result;
        }
    },

    sortListByKey: function(order, list, key) {
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < list.length; j++) {
                var value1 = list[i][key].toString().toLowerCase();
                var value2 = list[j][key].toString().toLowerCase();
                if (order == 'dsc' && value1 > value2 || order == 'asc' && value1 < value2) {
                    var temp = list[i];
                    list[i] = list[j];
                    list[j] = temp;
                }
            }
        }
    },

    getFirstName: function(name) {
        var i = name.lastIndexOf(' ');
        var first_name = name.substr(0, i);
        return first_name;
    },

    getLastName: function(name) {
        var i = name.lastIndexOf(' ');
        var last_name = name.substr(i + 1, name.length - 1);
        return last_name;
    },

    getProgramCodeFromClassName: function(class_name) {
        var program_code = '';
        for (var i = 0; i < class_name.length; i++) {
            if (isNaN(class_name[i])) {
                program_code += class_name[i];
            }
        }
        return program_code;
    },

    sendMail: function(from, to, subject, text) {
        fs.readFile('./api/data/settings.json', 'utf8', function (error, data) {
            if (error){
                if (error.code === 'ENOENT') {
                    return console.log('Setting file not found');
                } else {
                    return console.log(error);
                }
            }
            var settings = JSON.parse(data);
            for(var i = 0 ; i < settings.emails.length; i++){
                if(settings.selected_host == settings.emails[i].host_name){
                    let transporter = nodemailer.createTransport(settings.emails[i].config);
                    let mailOptions = {
                        from: from + ' <' + settings.emails[i].config.auth.user + '>',
                        to: to,
                        cc: 'lqvu@fit.hcmus.edu.vn',
                        subject: subject,
                        text: text,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        console.log('Mail send from ', from, ' to ' , to)
                    });
                }
            }
        });
    },
    
    removeExtraFromTeacherName: function(teacher_name) {
        var name = teacher_name;
        //cắt học vị
        var i = name.indexOf('. ');
        if (i != -1) {
            name = name.substr(i + 1, name.length - 1);
        }
        //cắt (+TA)
        i = name.lastIndexOf('(');
        if (i != -1) {
            name = name.substr(0, i - 1);
        }
        return name;
    },
    getEmailStudentApcs: function(teacher_name) {
        var email = '';

        var str = teacher_name;
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
        str = str.replace(/đ/g,"d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
        str = str.replace(/ + /g," ");
        str = str.trim();
        var words = str.split(' ')
        console.log(words)
        i = 0
        for (i = 0; i < words.length - 1; i++ )
          email += words[i][0].toLowerCase()
        email += words[i].toLowerCase()
        email += '@apcs.vn'
        console.log("email" , email)
        return email
    }
};
