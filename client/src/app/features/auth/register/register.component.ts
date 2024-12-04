import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';
import { MatButton } from '@angular/material/button';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextInputComponent,
    MatButton
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  public registerForm: FormGroup = new FormGroup({});
  private passwordSubscription?: Subscription;

  public ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(24)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    this.passwordSubscription = this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    });
  }

  private matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true}
    }
  }

  public register(): void {
    if (this.registerForm.valid) {
      const { confirmPassword, ...formValue } = this.registerForm.value;
      this.authService.register(formValue).subscribe({
        next: _ => {
          this.snackbar.success('Successfully registered. Now you can login');
          this.router.navigateByUrl('/login');
        }
      });
    }
  }

  public ngOnDestroy(): void {
    this.passwordSubscription?.unsubscribe();
  }
}
