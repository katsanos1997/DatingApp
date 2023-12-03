import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
//here, I can fix the non critical problem with 2 logins, eg first login as male_user, second login as female_user 
//-> during the second login the default value is FEMALE!!!  
//   - app\members\member-list\member-list.component.ts
//   - cashing
//   - I have to inject the member service here
//   - reset the user & member param in login()
export class NavComponent implements OnInit{
  model: any = {}

  constructor(public accountService: AccountService, private router: Router,
    private toastr: ToastrService) { }

  ngOnInit(): void {   
  }

  login(){
    this.accountService.login(this.model).subscribe({
      next: _ => {
        this.router.navigateByUrl('/members');
        this.model = {};
      }
    })
  }

  logout(){
    this.accountService.logout();
    this.router.navigateByUrl('/')
  }

}
