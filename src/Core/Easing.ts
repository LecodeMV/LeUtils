/**
 * A set of utilities to make easing and tweening easy and straightforward.
 * ```javascript
 * let myObj = { x: 10 };
 * let myTween = tween(myObj, 1000, 'easeInCubic')
 *   .onUpdate(object => {
 *     console.log('Updated object :', object);
 *   })
 *   .onStop(object => {
 *     console.log('Tweening stopped');
 *   })
 *   .from({ x: 0 })
 *   .to({ x: 50 });
 * // Can be stopped
 * myTween.stop();
 * ```   
 *
 * `tween` is asynchronous:
 * ```js
 * await tween({}, 500, 'linear').to({ x: 100});
 * ```   
 *
 * Using a tweening sheet:
 * ```javascript
 * let sheet: TweenSheetHolder = {
 *   'animation_a': {
 *     init() {
 *       return { x: 0};
 *     },
 *     duration: 600,
 *     goal() {
 *       return { x: 100};
 *     },
 *     easing: 'easeInOutCubic',
 *     // Optional
 *     onStop: () => {},
 *     onUpdate: () => {}
 *   }
 * };
 *
 * let tweenSheet = new TweenSheet(sheet);
 * await tweenSheet.start('animation_a');
 * ```
 *
 * @module Easing
 */

/**
 * 
 */
export type EasingName = keyof typeof Easing;

/**
 * Holds easing functions
 */
export const Easing = {
  linear(t: number) {
    return t;
  },
  easeInQuad: function(t: number) {
    return t * t;
  },
  easeOutQuad: function(t: number) {
    return t * (2 - t);
  },
  easeInOutQuad: function(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  easeInCubic: function(t: number) {
    return t * t * t;
  },
  easeOutCubic: function(t: number) {
    return --t * t * t + 1;
  },
  easeInOutCubic: function(t: number) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  easeInQuart: function(t: number) {
    return t * t * t * t;
  },
  easeOutQuart: function(t: number) {
    return 1 - --t * t * t * t;
  },
  easeInOutQuart: function(t: number) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  easeInQuint: function(t: number) {
    return t * t * t * t * t;
  },
  easeOutQuint: function(t: number) {
    return 1 + --t * t * t * t * t;
  },
  easeInOutQuint: function(t: number) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  },
  easeInSin: function(t: number) {
    return 1 + Math.sin((Math.PI / 2) * t - Math.PI / 2);
  },
  easeOutSin: function(t: number) {
    return Math.sin((Math.PI / 2) * t);
  },
  easeInOutSin: function(t: number) {
    return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
  },
  easeInElastic: function(t: number) {
    return (0.04 - 0.04 / t) * Math.sin(25 * t) + 1;
  },
  easeOutElastic: function(t: number) {
    return ((0.04 * t) / --t) * Math.sin(25 * t);
  },
  easeInOutElastic: function(t: number) {
    return (t -= 0.5) < 0
      ? (0.02 + 0.01 / t) * Math.sin(50 * t)
      : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1;
  }
};

export interface Tween {
  from: (obj: (() => Object) | Object) => Tween;
  to: (obj: (() => Object) | Object) => TweenPromise<any>;
  onUpdate: (func: (object: Object) => void) => Tween;
  onStop: (func: (object: Object) => void) => Tween;
}

export interface TweenPromise<T = any> extends Promise<T> {
  stop: () => void;
}

export function tween(
  object: (() => Object) | Object,
  duration: (() => number) | number,
  easing: EasingName = 'linear'
) {
  let _update = (object: Object) => {};
  let _stop = (object: Object) => {};
  let _operation: Tween;

  if (object instanceof Function) {
    object = object();
  }
  if (duration instanceof Function) {
    duration = duration();
  }

  const from = obj => {
    if (obj instanceof Function) {
      obj = obj();
    }
    for (const key of Object.keys(obj)) {
      object[key] = obj[key];
    }
    return _operation;
  };

  const onUpdate = func => {
    if (func) _update = func;
    return _operation;
  };

  const onStop = func => {
    if (func) _stop = func;
    return _operation;
  };

  const to = obj => {
    if (obj instanceof Function) {
      obj = obj();
    }
    let start = Date.now();
    let stopRequest = false;
    let p = new Promise((resolve, reject) => {
      let from = JSON.parse(JSON.stringify(object));
      let animation = () => {
        let now = Date.now();
        let t = duration > 0 ? (now - start) / (duration as number) : 1;
        let e = Easing[easing](t);
        for (const key of Object.keys(obj)) {
          let goal = obj[key];
          let start = from[key] || 0;
          object[key] = start + e * (goal - start);
        }
        _update(object);
        if (stopRequest || t >= 1) {
          for (const key of Object.keys(obj)) {
            object[key] = obj[key];
          }
          _update(object);
          resolve();
        } else {
          requestAnimationFrame(animation);
        }
      };
      animation();
    }) as TweenPromise;
    p.stop = function() {
      stopRequest = true;
      return p.then(_stop);
    };
    return p;
  };

  _operation = { from, to, onUpdate, onStop };
  return _operation;
}

export interface SheetObject {
  init: (() => Object) | Object;
  duration: (() => number) | number;
  easing: EasingName;
  goal: (() => Object) | Object;
  onUpdate?: (func: (object: Object) => void) => void;
  onStop?: (func: (object: Object) => void) => void;
}

export type TweenSheetHolder = { [name: string]: SheetObject };

export class TweenSheet {
  _sheet: TweenSheetHolder;
  _current: string;
  _tween: TweenPromise;

  constructor(sheet: TweenSheetHolder) {
    this._sheet = sheet;
    this._current = '';
    this._tween = null;
  }

  get current() {
    return this._current;
  }

  start(name: string) {
    let sheet = this._sheet[name];
    if (sheet) {
      if (Object.keys(sheet).length === 0) return;
      this._current = name;
      this.stop();
      return (this._tween = tween(sheet.init, sheet.duration, sheet.easing)
        .onUpdate(sheet.onUpdate)
        .onStop(sheet.onStop)
        .to(sheet.goal));
    }
    throw new Error("Tween sheet doesn't contain animation: " + name);
  }

  stop() {
    if (this._tween) {
      this._tween.stop();
    }
  }
}
