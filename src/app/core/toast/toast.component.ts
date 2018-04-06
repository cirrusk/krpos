import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ToastService } from '../service/toast.service';

@Component({
  moduleId: module.id,
  selector: 'pos-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {

  private default = { title: '', message: 'default message received!'};
  private toastElement: any;
  private toastSubscription: Subscription;
  title: string;
  message: string;
  constructor(private toastService: ToastService) {
    this.toastSubscription = this.toastService.toastState.subscribe(
      (toastMessage) => {

      }
    );
  }

  ngOnInit() {
    this.toastElement = document.getElementById('toast');
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }

  active(title = this.default.title, message = this.default.message) {
    this.title = title;
    this.message = message;
    this.show();
  }

  private show() {
    this.toastElement.style.opacity = 1;
    this.toastElement.style.zIndex = 9997;
    window.setTimeout(() => this.hide(), 3500);
  }

  private hide() {
    this.toastElement.style.opacity = 0;
    window.setTimeout(() => this.toastElement.style.zIndex = 0, 400);
  }
}
