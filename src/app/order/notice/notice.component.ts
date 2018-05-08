import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2, OnDestroy } from '@angular/core';

@Component({
  selector: 'pos-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.css'],

})
export class NoticeComponent implements OnInit, OnDestroy {

  @ViewChildren ('noticelist') noticelist: QueryList<ElementRef>;
  public noticeList: string[] = [];
  private intervalid;
  private idx = 0;
  private noticeSize = 0;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    this.noticeList.push('1. 3월 26일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 1588 - 0000');
    this.noticeList.push('2. 3월 27일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 1588 - 0000');
    this.noticeList.push('3. 3월 28일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 1588 - 0000');
    this.noticeList.push('4. 4월 01일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 1588 - 0000');
    this.noticeList.push('5. 4월 03일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 1588 - 0000');

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
