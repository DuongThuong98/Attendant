import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/app.service';

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
})
export class SideMenuComponent implements OnInit {

    public constructor(public  authService: AuthService, public  appService: AppService) {
        switch (authService.current_user.role_id) {
            case appService.userType.staff:
                this.sideMenu = this.staffMenu;
                break;
            case this.appService.userType.student:
                this.sideMenu = this.studentMenu;
                break;
            case this.appService.userType.teacher:
                this.sideMenu = this.teacherMenu;
                break;
            case this.appService.userType.admin:
                this.sideMenu = this.adminMenu;
                break;
        }
    }

    public ngOnInit() {}

    public sideMenu: Array < any > = [];

    public adminMenu = [
        { title: 'Dashboard', url: '/', icon: 'fa-home' },
        // { title: 'Clear Data', url: '/clear-data', icon: 'fa-database' },
        { title: 'Settings', url: '/settings', icon: 'fa-cog' },
        { title: 'Logout', url: '/logout', icon: 'fa-sign-out' }
    ];

    public staffMenu = [
        { title: 'Dashboard', url: '/', icon: 'fa-home' },
        { title: 'Statistic', url: '/statistic', icon: 'fa-line-chart' }, 
        { title: 'Students', url: '/students', icon: 'fa-user' },
        { title: 'Courses', url: '/courses', icon: 'fa-book' },
        { title: 'Teachers', url: '/teachers', icon: 'fa-graduation-cap' },
        { title: 'Schedule', url: '/schedule', icon: 'fa-calendar' },
        { title: 'Absence Requests', url: '/absence-requests', icon: 'fa-envelope' },
        { title: 'Feedbacks', url: '/feedbacks', icon: 'fa-comments' }, 
        { title: 'Classes', url: '/classes', icon: 'fa-users' }, 
        { title: 'Programs', url: '/programs', icon: 'fa-institution' }, 
        { title: 'Semesters', url: '/semesters', icon: 'fa-calendar-plus-o' }, 
        { title: 'Logout', url: '/logout', icon: 'fa-sign-out' }
    ];

    public studentMenu = [
        { title: 'Dashboard', url: '/', icon: 'fa-home' },
        { title: 'Attendance - Checklist',url: '/check-attendance',icon: 'fa-check-square-o' },
        { title: 'Attendance - Quiz',url: '/check-attendance/quiz',icon: 'fa-question-circle' },
        { title: 'Schedule', url: '/schedule', icon: 'fa-calendar' },
        { title: 'Feedbacks', url: '/feedbacks', icon: 'fa-comments' },
        { title: 'Absence Requests', url: '/absence-requests', icon: 'fa-envelope' },
        { title: 'Logout', url: '/logout', icon: 'fa-sign-out' }
    ];

    public teacherMenu = [
        { title: 'Dashboard', url: '/', icon: 'fa-home' },
        { title: 'Check Attendance',url: '/check-attendance',icon: 'fa-check-square-o' },
        { title: 'Quiz',url: '/quiz',icon: 'fa-question-circle' },
        { title: 'Schedule', url: '/schedule', icon: 'fa-calendar' },
        { title: 'Feedbacks', url: '/feedbacks', icon: 'fa-comments' },
        { title: 'Logout', url: '/logout', icon: 'fa-sign-out' }
    ];
}
