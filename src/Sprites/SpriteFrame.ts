import { Sprite_Base, Bitmap, Sprite_Animation, Sprite } from 'mv-lib';

export type AnimationType = 'once' | 'run' | 'inf';

export class SpriteFrame extends Sprite_Base {
  _nbrFrames: number;
  _frameIndex: number | 'last';
  _fixedFrameIndex: number;
  _frameOrder: number[];
  _frameOrderIndex: number;
  _frameDelay: number;
  _frameDelayCounter: number;
  _animationType: AnimationType;
  constructor(bitmap: Bitmap, nbrFrames: number) {
    super();
    this.bitmap = bitmap;
    this._nbrFrames = nbrFrames;
    this._frameIndex = 0;
    this._fixedFrameIndex = null;
    this._frameOrder = [...Array(nbrFrames).keys()];
    this._frameOrderIndex = 0;
    this._frameDelay = 8;
    this._frameDelayCounter = 0;
    this._animationType = null;
    if (bitmap) {
      bitmap.addLoadListener(bitmap => {
        this.setFrameIndex(0);
      });
    }
  }

  setAnimDelay(speed: number) {
    this._frameDelay = speed;
    this._frameDelayCounter = 0;
  }

  setFrameOrder(order: number[]) {
    this._frameOrder = order;
    this._frameOrderIndex = 0;
  }

  startFrameAnimation(type: AnimationType) {
    this._animationType = type;
    this._fixedFrameIndex = null;
  }

  stopFrameAnimation() {
    this._animationType = null;
    this._frameDelayCounter = 0;
  }

  setFrameIndex(index: number | 'last') {
    this.stopFrameAnimation();
    this._fixedFrameIndex = index === 'last' ? this._nbrFrames - 1 : index;
    this.updateFrameAnimation();
  }

  resetFrameIndex() {
    this._frameIndex = 0;
  }

  update() {
    super.update();
    if (this.bitmap && this.bitmap.isReady() && this._animationType) {
      this.updateFrameIndex();
      this.updateFrameAnimation();
    }
  }

  updateFrameIndex() {
    if (this._frameDelayCounter === this._frameDelay) {
      this._frameDelayCounter = 0;
      this._frameOrderIndex++;
      if (this._frameOrderIndex >= this._frameOrder.length) {
        this._frameOrderIndex = 0;
        this.onAnimationEnd();
      }
      this._frameIndex = this._frameOrder[this._frameOrderIndex];
    } else {
      this._frameDelayCounter++;
    }
  }

  updateFrameAnimation() {
    let f = this._frameIndex as number;
    if (this._fixedFrameIndex != null) f = this._fixedFrameIndex;
    let w = this.bitmap.width / this._nbrFrames;
    let x = f * w;
    let y = 0;
    let h = this.bitmap.height;
    this.setFrame(x, y, w, h);
  }

  onAnimationEnd() {
    const type = this._animationType;
    if (type === 'once') {
      this.setFrameIndex('last');
    } else if (type === 'inf') {
      // Infinite animation
    } else if (type === 'run') {
      this.setFrameIndex(0);
    }
  }

  startAnimation(animation: number, mirror: boolean, delay = 0) {
    const sprite = new Sprite_Animation();
    sprite.updatePosition = this.updatePositionForAnimation.bind(this, sprite);
    sprite.setup(this._effectTarget, animation, mirror, delay);
    this.parent.addChild(sprite);
    this._animationSprites.push(sprite);
  }

  updatePositionForAnimation(animSprite: Sprite) {
    if (animSprite._animation.position === 3) {
      animSprite.x = animSprite.parent.width / 2;
      animSprite.y = animSprite.parent.height / 2;
    } else {
      const target = animSprite._target;
      animSprite.x = target.x + target.width / 2;
      animSprite.y = target.y + target.height;
      if (animSprite._animation.position === 0) {
        animSprite.y -= animSprite._target.height;
      } else if (animSprite._animation.position === 1) {
        animSprite.y -= animSprite._target.height / 2;
      }
    }
  }
}
