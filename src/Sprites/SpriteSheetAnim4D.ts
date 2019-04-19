import { SpriteFrame4D } from './SpriteFrame4D';
import { Stance } from './SpriteSheetAnim';
import { AnimationType } from './SpriteFrame';
import { Bitmap } from 'mv-lib';

export interface Stance4D extends Stance {
  isStatic: boolean;
}

export class SpriteSheetAnim4D extends SpriteFrame4D {
  _stances: { [name: string]: Stance4D };
  _stance: Stance4D;
  _defaultStance: Stance4D;
  _callback: () => any;
  constructor() {
    super();
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
    isStatic = false,
    isDefault = false
  ) {
    bitmap.addLoadListener(() => {
      this._stances[name] = {
        name,
        bitmap,
        nbrFrames,
        frameOrder: frameOrder || [...Array(nbrFrames).keys()],
        isStatic
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
      this.setStatic(stance.isStatic);
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
