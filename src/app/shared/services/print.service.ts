import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrintService {
  print(id?: string) {
    if (id) {
      const el = document.getElementById(id);
      if (!el) return window.print();
      const w = window.open('', 'PRINT', 'height=800,width=600');
      if (!w) return;
      w.document.write(
        `<html><head><title>${document.title}</title></head><body>${el.outerHTML}</body></html>`,
      );
      w.document.close();
      w.focus();
      w.print();
      w.close();
    } else {
      window.print();
    }
  }
}
