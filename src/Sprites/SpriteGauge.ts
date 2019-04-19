import { Sprite, Bitmap } from 'mv-lib';

export class SpriteMeter extends Sprite {
  _xOffset: number;
  _yOffset: number;
  _fullSprite: Sprite;

  constructor(backBmp: Bitmap, fullBmp: Bitmap, iniRate: number) {
    super(backBmp);
    this._xOffset = 0;
    this._yOffset = 0;
    this._fullSprite = new Sprite(fullBmp);
    this.addChild(this._fullSprite);
    fullBmp.addLoadListener(() => {
      this.updateValue(iniRate);
    });
  }

  enableAnimation(backAnimBitmap: Bitmap, duration: number) {}

  setOffset(x: number, y: number) {
    this._xOffset = x;
    this._yOffset = y;
  }

  update() {
    super.update();
    this.updateFullPosition();
  }

  updateFullPosition() {
    this._fullSprite.x = this._xOffset - this.width / 2;
    this._fullSprite.y = this._yOffset - this.height / 2;
  }

  updateValue(rate: number) {
    const maxWidth = this.width;
    const newWidth = rate * maxWidth;
    this._fullSprite.width = newWidth;
  }
}
