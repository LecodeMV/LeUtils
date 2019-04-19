import { Window_Base, TouchInput } from 'mv-lib';

export type WindowHandler = ReturnType<typeof handler>;
export type Position = number | 'center';

export default function handler(window: Window_Base) {
  let _float = false;
  let _floatData = {
    ini_pos: [0, 0], //[x,y]
    range: [0, 0],
    dir: ['+', '+'],
    speed: 3
  };

  const Window_Base = {
    drawText(text: string, x: Position, y: Position, lineHeight = window.lineHeight()) {
      //LeUtils.positionateInRect
      if (x === 'center') {
        x = window.contentsWidth() / 2 - (window.textWidth(text) + 1) / 2;
      }
      if (y === 'center') {
        y = window.contentsHeight() / 2 - (window.contents.fontSize + 1) / 2;
      }
      let rect = {
        x: x,
        y: y,
        w: window.textWidth(text) + 1,
        h: window.contents.fontSize + 1
      };
      window.drawText(text, x, y, window.contentsWidth(), lineHeight);
      return rect;
    },
    isMouseInsideFrame() {
      return window.getBounds().contains(TouchInput._x, TouchInput._y);
    }
  };

  function updateFloat() {
    if (!_float) return;
    let data = _floatData;
    //- X
    let op = data.dir[0] === '+' ? 'this.x+data.speed' : 'this.x-data.speed';
    let fx = eval(op);
    let dist = Math.abs(fx - data.ini_pos[0]);
    if (dist >= data.range[0]) {
      fx = window.x;
      data.dir[0] = data.dir[0] === '+' ? '-' : '+';
    }
    window.move(fx, window.y, window.width, window.height);
    //- Y
    op = data.dir[1] === '+' ? 'this.y+data.speed' : 'this.y-data.speed';
    let fy = eval(op);
    dist = Math.abs(fy - data.ini_pos[1]);
    if (dist >= data.range[1]) {
      fy = window.y;
      data.dir[1] = data.dir[1] === '+' ? '-' : '+';
    }
    window.move(window.x, fy, window.width, window.height);
  }

  /*let old_update = window.update;
        window.update = function() {
            old_update.call(this);
            Window_Base.updateFloat();
        };*/

  return Window_Base;
}
