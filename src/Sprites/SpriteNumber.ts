import { Sprite, Bitmap } from 'mv-lib';

export class SpriteNumber extends Sprite {
  _nbrBitmap: Bitmap;
  constructor(nbrBitmap: Bitmap, valIni = 0) {
    super();
    this._nbrBitmap = nbrBitmap;
    nbrBitmap.addLoadListener(() => {
      this.setValue(valIni);
    });
  }

  space() {
    return 0;
  }

  setValue(value: number) {
    const string = Math.abs(value).toString();
    const space = this.space();
    const w = this._nbrBitmap.width / 10;
    const h = this._nbrBitmap.height;
    const bmpWidth = value === 0 ? w : w * string.length + space * (string.length - 1);
    this.bitmap = new Bitmap(bmpWidth, h);
    for (let i = 0; i < string.length; i++) {
      const n = Number(string[i]);
      const x = (w + space) * i;
      this.bitmap.blt(this._nbrBitmap, n * w, 0, w, h, x, 0);
    }
  }
}
