import { LowerCasePipe, NgClass, NgIf } from '@angular/common';
import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    NgIf,
    NgClass,
    MatError,
    LowerCasePipe,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss'
})
export class TextInputComponent implements ControlValueAccessor {
  public label = input<string>('');
  public type = input<string>('text');

  constructor(@Self() public ngControl: NgControl){
    this.ngControl.valueAccessor = this;
  }

  public writeValue(obj: any): void {}

  public registerOnChange(fn: any): void {}

  public registerOnTouched(fn: any): void {}
  
  get control(): FormControl {
    return this.ngControl.control as FormControl;
  }
}
