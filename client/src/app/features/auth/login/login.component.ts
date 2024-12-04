import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextInputComponent,
    MatButton
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public loginForm: FormGroup = new FormGroup({});

  public ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(24)]],
    });
  }

  public login(): void {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      this.authService.login(formValue).subscribe({
        next: _ => this.router.navigateByUrl('/')
      });
    } 
  }
}
