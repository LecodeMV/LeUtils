import { SpriteFrame, AnimationType } from './SpriteFrame';
import { Bitmap } from 'mv-lib';

export interface Stance {
  name: string;
  bitmap: Bitmap;
  nbrFrames: number;
  frameOrder: number[];
}

export class SpriteSheetAnim extends SpriteFrame {
  _stances: { [name: string]: Stance };
  _stance: Stance;
  _defaultStance: Stance;
  _callback: () => any;
  constructor() {
    super(null, 1);
    this._stances = {};
    this._stance = null;
    this._defaultStance = null;
    this._callback = null;
  }

  defineStance(
    name: string,
    bitmap: Bitmap,
    nbrFrames: number,
    frameOrder: number[],
    isDefault = false
  ) {
    bitmap.addLoadListener(() => {
      this._stances[name] = {
        name,
        bitmap,
        nbrFrames,
        frameOrder: frameOrder || [...Array(nbrFrames).keys()]
      };
      if (isDefault) {
        this._defaultStance = this._stances[name];
        this.setStance(name, 'inf');
      }
    });
  }

  setStance(name: string, animType: AnimationType, callback: () => any = null) {
    const stance = this._stances[name];
    if (stance) {
      this.stopFrameAnimation();
      this.bitmap = stance.bitmap;
      this._nbrFrames = stance.nbrFrames;
      this.resetFrameIndex();
      this.setFrameOrder(stance.frameOrder);
      this.startFrameAnimation(animType);
      this.updateFrameAnimation();
      this._callback = callback;
    }
  }

  onAnimationEnd() {
    super.onAnimationEnd();
    if (this._callback) {
      this._callback();
      this._callback = null;
    }
  }
}
