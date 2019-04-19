import { SpriteFrame } from './SpriteFrame';

export class SpriteFrame4D extends SpriteFrame {
  _dir: 2 | 4 | 6 | 8;
  _isStatic: boolean;

  constructor() {
    super(null, 1);
    this._dir = 2;
    this._isStatic = false;
  }

  setDirection(dir: 2 | 4 | 6 | 8) {
    this._dir = dir;
  }

  setStatic(stati: boolean) {
    this._isStatic = stati;
  }

  isStatic() {
    return !!this._isStatic;
  }

  updateFrameAnimation() {
    let f = this._frameIndex as number;
    if (this._fixedFrameIndex != null) f = this._fixedFrameIndex;
    let w = this.bitmap.width / this._nbrFrames;
    let x = f * w;
    let h = this.bitmap.height / (this._isStatic ? 1 : 4);
    let y = this._isStatic ? 0 : (h * this._dir) / 2 - h;
    this.setFrame(x, y, w, h);
  }
}
