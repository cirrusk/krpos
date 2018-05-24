import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-order-complete',
  templateUrl: './order-complete.component.html'
})
export class OrderCompleteComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goOrder() {
    this.router.navigate(['/order']);
  }

}
