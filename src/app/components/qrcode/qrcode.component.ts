import {
  NgModule,
  Component,
  Input,
  ElementRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import * as qrcode from 'qrcode-generator';

@Component({
  moduleId: 'module.id',
  selector: 'app-qr-code',
  template: ``
})
export class QRCodeComponent implements OnChanges {
  @Input() level = 'L';
  @Input() padding = 0;
  @Input() size = 150;
  @Input() value = '';

  constructor(private elementRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('level' in changes ||
    'padding' in changes ||
    'size' in changes ||
    'value' in changes) {
      this.generate();
    }
  }

  generate() {
    if (!this.value) {
      return;
    }

    try {
      const qr = qrcode(4, this.level);
      qr.addData(this.value);
      qr.make();

      const imgTagString = qr.createImgTag(4, this.padding);
      const el: HTMLElement = this.elementRef.nativeElement;
      el.innerHTML = imgTagString;

      const imgTagObject: HTMLImageElement = <HTMLImageElement> el.firstElementChild;
      imgTagObject.width = this.size;
      imgTagObject.height = this.size;
    } catch (e) {
      console.error(`Could not generate QR Code: ${e.message}`);
    }
  }
}
