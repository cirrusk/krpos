import { Component, OnInit, ViewChildren, ElementRef, Input, QueryList, Renderer2, OnDestroy } from '@angular/core';

@Component({
  selector: 'pos-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.css'],

})
export class NoticeComponent implements OnInit, OnDestroy {

  @Input() tagmsg: string;
  @Input() noticeList: string[] = [];
  @ViewChildren ('noticelist') noticelist: QueryList<ElementRef>;
  private intervalid;
  private idx = 0;
  private noticeSize = 0;

  constructor(private renderer: Renderer2) { }

  // https://www.bennadel.com/blog/3139-experimenting-with-conditional-enter-leave-animations-in-angular-2-rc-6.htm
  // https://medium.com/@tanya/angular4-animated-route-transitions-b5b9667cd67c
  // https://angular.io/api/animations/stagger
  // * https://stackblitz.com/edit/angular-list-animations
  ngOnInit() {
    this.noticeSize = this.noticeList.length;
    this.start();
  }

  ngOnDestroy() {
    this.end();
  }

   private start() {
    this.intervalid = setInterval(() => {
      this.noticeRenderStart(this.idx++);
    }, 1000 * 7);
  }

  private end() {
    this.noticeRenderEnd();
    this.idx = 0;
    this.start();
  }

  private noticeRenderStart(idx: number) {
    let nidx = 0;
    this.noticelist.forEach(notice => {
      if (nidx === idx) {
        this.renderer.removeStyle(notice.nativeElement, 'display');
      } else {
        this.renderer.setStyle(notice.nativeElement, 'display', 'none');
      }
      nidx++;
    });
    if (idx === (this.noticeSize - 1)) {
      this.end();
    }
  }

  private noticeRenderEnd() {
    clearInterval(this.intervalid);
  }
}
