import { Component, OnInit, AfterViewInit, ContentChildren, Directive,
  Input, QueryList, ElementRef, ViewChild, ViewChildren, OnDestroy } from '@angular/core';
  import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';
import { PromotionItemDirective } from './promotion-item.directive';
import { Config } from '../../core';

@Directive({
  selector: '.posPromotionItemElement'
})
export class PromotionItemElementDirective {
}

@Component({
  selector: 'pos-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.css']
})
export class PromotionComponent implements OnInit, OnDestroy, AfterViewInit {

  @ContentChildren(PromotionItemDirective) items: QueryList<PromotionItemDirective>;
  @ViewChildren(PromotionItemElementDirective, { read: ElementRef }) private itemsElements: QueryList<ElementRef>;
  @ViewChild('carousel') private carousel: ElementRef;
  @Input() timing = '0.2s 100ms ease-in-out'; // ease-in-out, ease-out, ease-in, cubic-bezier(.17,.67,.88,.1)
  @Input() showControls = true;
  private player: AnimationPlayer;
  private itemWidth: number;
  private intervalid;
  private pterm = 7;
  private pIndex = 0;
  currentSlide = 0;
  carouselWrapperStyle = {};
  constructor(private builder: AnimationBuilder, private config: Config) { }

  ngOnInit() {
    this.pterm = this.config.getConfig('promotionInterval', 9);
    this.start();
  }

  ngOnDestroy() {
    clearInterval(this.intervalid);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.itemWidth = this.itemsElements.first.nativeElement.getBoundingClientRect().width;
      this.itemWidth = (this.itemWidth < 100) ? 140 : this.itemWidth;
      this.carouselWrapperStyle = { width: `${this.itemWidth}px` };
    });
  }

  private start() {
    this.intervalid = setInterval(() => {
      this.next(this.pIndex++);
    }, 1000 * this.pterm);
  }

  private end() {
    clearInterval(this.intervalid);
    this.pIndex = 0;
    this.currentSlide = 0;
    this.start();
  }

  private buildAnimation( offset ) {
    return this.builder.build([
      animate(this.timing, style({ transform: `translateX(-${offset}px)` }))
    ]);
  }

  prev() {
    if ( this.currentSlide === 0 ) { return; }
    this.currentSlide = ((this.currentSlide - 1) + this.items.length) % this.items.length;
    const offset = this.currentSlide * this.itemWidth;
    const myAnimation: AnimationFactory = this.buildAnimation(offset);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.play();
  }

  next(pindx?: number) {
    if (pindx > 0 && (pindx === this.items.length)) { this.end(); return; }
    if ( this.currentSlide + 1 === this.items.length ) { this.currentSlide = -1; }
    this.currentSlide = (this.currentSlide + 1) % this.items.length;
    const offset = this.currentSlide * this.itemWidth;
    const myAnimation: AnimationFactory = this.buildAnimation(offset);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.play();
  }

}
