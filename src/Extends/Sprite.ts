import { Sprite_Base } from 'mv-lib';

export type SpriteHandler = ReturnType<typeof handler>;
export type Color = [number, number, number, number];
export type FlashMode = 'blend' | 'tone' | 'opacity';

export default function handler(sprite: Sprite_Base) {
  let _flashColor = [0, 0, 0, 0];
  let _flashDuration = 0;
  let _loopFlash = false;
  let _loopFlashData = {
    color: [0, 0, 0, 0],
    duration: 0
  };
  let _flashMode: FlashMode = 'blend';

  const Sprite = {
    startFlash(color: Color, duration: number) {
      _flashColor = [...color];
      _flashDuration = duration;
    },
    startLoopFlash(color: Color, duration: number) {
      _loopFlash = true;
      _loopFlashData = {
        color: [...color],
        duration: duration
      };
    },
    setFlashMode(mode: FlashMode) {
      _flashMode = mode;
    },
    endLoopFlash() {
      _loopFlash = false;
    },
    clearFlash() {
      sprite.setBlendColor([0, 0, 0, 0]);
      sprite.setColorTone([0, 0, 0, 0]);
    }
  };

  function updateFlash() {
    if (_flashDuration > 0) {
      let d = _flashDuration--;
      _flashColor[3] *= (d - 1) / d;
    }
    if (_loopFlash && _flashDuration === 0)
      Sprite.startFlash(_loopFlashData.color as any, _loopFlashData.duration);
    switch (_flashMode) {
      case 'blend':
        sprite.setBlendColor(_flashColor);
        break;
      case 'tone':
        sprite.setColorTone(_flashColor);
        break;
      case 'opacity':
        sprite.opacity = _flashColor[3];
        break;
    }
  }

  let old_update = sprite.update;
  sprite.update = function() {
    old_update.call(this);
    updateFlash();
  };

  return Sprite;
}
