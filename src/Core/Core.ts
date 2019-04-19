/**
 * A set of utilities functions to help with developing RPG Maker MV plugins.
 * 
 * @module Core
 */
import { ArrayHandler } from '../Extends/Array';
import { GameBattlerHandler } from '../Extends/Game_Battler';
import { NumberHandler } from '../Extends/Number';
import { SpriteHandler } from '../Extends/Sprite';
import { StringHandler } from '../Extends/String';
import { WindowHandler } from '../Extends/Window_Base';
import {
  Game_BattlerBase,
  Window_Base,
  Scene_Base,
  SceneManager,
  Game_Battler,
  Sprite_Battler,
  Scene_Battle,
  $gameMap,
  $gameSelfSwitches,
  ImageManager,
  Bitmap,
  Game_Event,
  Point,
  Sprite
} from 'mv-lib';

/**
 * @ignore
 */
const _handle = new Map<string, <T>(arg: any) => any>();

/**
 * @ignore
 */
const _sym = Symbol();

/**
 * @ignore
 */
function getConstructors(obj: Object) {
  let res = [];
  let pro = obj;
  do {
    pro = Object.getPrototypeOf(pro);
    if (pro) res.push(pro.constructor.name);
  } while (pro);
  return res;
}

/**
 * Handle an object
 * @returns A set of functions available for the object passed in argument
 */
export function $<T = any>(arg: T): Handler<T> {
  for (const name of getConstructors(arg)) {
    const call = _handle.get(name);
    if (call) {
      if (Object(arg) !== arg) {
        // Is primitive
        return call<typeof arg>(arg);
      }
      return arg[_sym] || (arg[_sym] = call(arg));
    }
  }
  throw new Error("LeUtils can't handle " + arg);
}

/**
 * @ignore
 */
export type Handler<T> = T extends Array<any>
  ? ArrayHandler<T>
  : (T extends Game_BattlerBase
      ? GameBattlerHandler
      : (T extends Number
          ? NumberHandler
          : (T extends Sprite
              ? SpriteHandler
              : (T extends String
                  ? StringHandler
                  : (T extends Window_Base ? WindowHandler : never)))));

/**
 * Extend LeUtils to handle to certain types of object
 */
export function $extends(className: string, call: (arg: any) => any) {
  if (!(call instanceof Function)) {
    throw new Error('2nd parameter should be a function');
  }
  _handle.set(className, call);
}

/**
 * Get the current active Scene of the game
 */
export function getScene(): Scene_Base {
  return SceneManager._scene;
}

export function isScene(sceneName: string) {
  const scene = getScene();
  for (const name of getConstructors(scene)) {
    if (name === sceneName) return true;
  }
  return false;
}

export function findBattlerSprite(battler: Game_Battler): Sprite_Battler {
  if (isScene('Scene_Battle')) {
    let sprites: Sprite_Battler[] = [];
    const scene = getScene() as Scene_Battle;
    if (battler.isActor()) {
      sprites = scene._spriteset._actorSprites;
    } else {
      sprites = scene._spriteset._enemySprites;
    }
    for (let i = 0; i < sprites.length; i++) {
      const sprite = sprites[i];
      if (sprite._battler === battler) return sprite;
    }
  } else {
    return null;
  }
}

export function removeAllChildren(holder: Sprite) {
  while (holder.children[0]) {
    holder.removeChild(holder.children[0]);
  }
}

export function AToBRelation(x: number, x1: number, x2: number, y1: number, y2: number, s: number) {
  s = s || 1.0;
  return ((y2 - y1) / Math.pow(x2 - x1, s)) * 1.0 * Math.pow(x - x1, s) + y1;
}

export function distance(a: Point, b: Point) {
  let dx = (isNaN(a.x) ? a[0] : a.x) - (isNaN(b.x) ? b[0] : b.x);
  let dy = (isNaN(a.y) ? a[1] : a.y) - (isNaN(b.y) ? b[1] : b.y);
  return Math.sqrt(dx * dx + dy * dy);
}

export function cellDistance(a: Point, b: Point) {
  let dx = Math.abs((isNaN(a.x) ? a[0] : a.x) - (isNaN(b.x) ? b[0] : b.x));
  let dy = Math.abs((isNaN(a.y) ? a[1] : a.y) - (isNaN(b.y) ? b[1] : b.y));
  return dx + dy;
}

export function sortByDistance(obj: Point, array: Point[], prop?: (p: Point) => Point) {
  return array.sort((a, b) => {
    let obj_aDist = distance(prop ? prop(a) : a, obj);
    let obj_bDist = distance(prop ? prop(b) : b, obj);
    return obj_aDist - obj_bDist;
  });
}

export function sortByCellDistance(obj: Point, array: Point[], prop?: (p: Point) => Point) {
  return array.sort((a, b) => {
    let obj_aDist = cellDistance(prop ? prop(a) : a, obj);
    let obj_bDist = cellDistance(prop ? prop(b) : b, obj);
    return obj_aDist - obj_bDist;
  });
}

export function closestByDistance(obj: Point, array: Point[]) {
  return sortByDistance(obj, array)[0];
}

export function farthestByDistance(obj: Point, array: Point[]) {
  return $(sortByDistance(obj, array)).last();
}

export function closestByCellDistance(obj: Point, array: Point[]) {
  return sortByCellDistance(obj, array)[0];
}

export function farthestByCellDistance(obj: Point, array: Point[]) {
  return $(sortByCellDistance(obj, array)).last();
}

export function getWrappedLines(text: string, window: Window_Base) {
  let words = text.split(' ');
  let lines: string[] = [];
  let line = '';
  let lineWidth = 0;
  for (let i = 0; i < words.length; i++) {
    let word = i === words.length - 1 ? words[i] : words[i] + ' ';
    lineWidth += window.textWidth(word);
    if (lineWidth > window.contentsWidth()) {
      i--;
      lineWidth = 0;
      lines.push(line);
      line = '';
      continue;
    }
    line += word;
    if (i === words.length - 1) lines.push(line);
  }
  return lines;
}

export function kebabToCamelCase(text: string, lower: boolean) {
  return text
    .replace(/_(.)/gi, function(word) {
      return word[1].toUpperCase();
    })
    .replace(/\b(.)/i, function(word) {
      if (lower) return word;
      return word.toUpperCase();
    });
}

export function getPixelsOfLine(x0: number, y0: number, x1: number, y1: number, sprite?: Sprite) {
  let pixels: [number, number][] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    pixels.push([x0, y0]);
    if (sprite) sprite.bitmap.fillRect(x0, y0, 1, 1, '#000000');

    if (x0 == x1 && y0 == y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return pixels;
}

export function EXP_getPixelsOfParabola(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  height: number
) {
  if (x0 == x1 || y0 === y1) return getPixelsOfLine(x0, y0, x1, y1);
  let pixels: [number, number][] = [];
  let top_y, top_x, start_x, start_y, dest_x, dest_y;

  top_y = (y0 + y1) / 2 - height;
  if (y0 > y1) {
    start_y = y1;
    dest_y = y0;
  } else {
    start_y = y0;
    dest_y = y1;
  }
  if (x0 > x1) {
    start_x = x1;
    dest_x = x0;
  } else {
    dest_x = x1;
    start_x = x0;
  }
  let k = -Math.sqrt((top_y - start_y) / (top_y - dest_y));
  let v = (k * dest_x - start_x) / (k - 1);
  let u = (top_y - start_y) / ((start_x - v) * (start_x - v));
  for (let x = start_x; x <= dest_x; x++) {
    let y = top_y - u * (x - v) * (x - v);
    pixels.push([Number(x), Number(y)]);
  }
  if (x0 > x1) pixels.reverse();
  return pixels;
}

export function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function getPixelsOfParabola(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
) {
  if (x1 == x3) return getPixelsOfLine(x1, y1, x3, y3);
  let pixels: [number, number][] = [];
  let a =
    (x1 * (y3 - y2) - x2 * y3 + y2 * x3 + y1 * (x2 - x3)) /
    (x1 * (x3 * x3 - x2 * x2) - x2 * (x3 * x3) + x2 * x2 * x3 + x1 * x1 * (x2 - x3));
  let b =
    -(x1 * x1 * (y3 - y2) - x2 * x2 * y3 + y2 * (x3 * x3) + y1 * (x2 * x2 - x3 * x3)) /
    (x1 * (x3 * x3 - x2 * x2) - x2 * (x3 * x3) + x2 * x2 * x3 + x1 * x1 * (x2 - x3));
  let c =
    (x1 * (y2 * (x3 * x3) - x2 * x2 * y3) +
      x1 * x1 * (x2 * y3 - y2 * x3) +
      y1 * (x2 * x2 * x3 - x2 * (x3 * x3))) /
    (x1 * (x3 * x3 - x2 * x2) - x2 * (x3 * x3) + x2 * x2 * x3 + x1 * x1 * (x2 - x3));
  let start_x;
  let end_x;
  if (x1 <= x3) {
    start_x = x1;
    end_x = x3;
  } else {
    start_x = x3;
    end_x = x1;
  }
  for (let x = start_x; x <= end_x; x++) {
    let y = a * x * x + b * x + c;
    pixels.push([x, y]);
  }
  return pixels;
}

export function getPixelsOfJump(sx: number, sy: number, dx: number, dy: number, h: number) {
  let mx = sx + (sx - dx) / 2;
  let my = sy + (sy - dy) / 2 + h;
  return getPixelsOfParabola(sx, sy, mx, my, dx, dy);
}

export function randomValueBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function directionCodeToText(dirCode: 2 | 4 | 6 | 8) {
  switch (dirCode) {
    case 2:
      return 'down';
    case 4:
      return 'left';
    case 6:
      return 'right';
    case 8:
      return 'up';
  }
  return null;
}

export function directionTextToCode(dirText: 'down' | 'left' | 'right' | 'up') {
  switch (dirText) {
    case 'down':
      return 2;
    case 'left':
      return 4;
    case 'right':
      return 6;
    case 'up':
      return 8;
  }
  return null;
}

export function resetMapEvents() {
  let letters = ['A', 'B', 'C', 'D'];
  let events = $gameMap.events();
  for (let i = 0; i < events.length; i++) {
    let id = events[i].eventId();
    let mapId = events[i]._mapId;
    for (let j = 0; j < letters.length; j++) {
      let key = [mapId, id, letters[j]];
      $gameSelfSwitches.setValue(key, 0);
    }
    events[i].refresh();
  }
}

export function stringToArray(str: string) {
  if (!str) return [];
  str = str.replace(/ /gi, '').replace(/,$/, '');
  return str
    .replace(/ /gi, '')
    .split(',')
    .map(function(data) {
      if (isNaN(Number(data.trim()))) return String(data).trim();
      return Number(data.trim());
    });
}

export function hexToRgb(hex: string) {
  let str = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return str
    ? {
        r: parseInt(str[1], 16),
        g: parseInt(str[2], 16),
        b: parseInt(str[3], 16)
      }
    : null;
}

export function aOrB(a: any, b: any) {
  return Math.random() >= 0.5 ? a : b;
}

export function getBezier(t: number, C1: Point, C2: Point, C3: Point, C4: Point) {
  let pos = { x: 0, y: 0 };
  let b1 = t * t * t;
  let b2 = 3 * t * t * (1 - t);
  let b3 = 3 * t * (1 - t) * (1 - t);
  let b4 = (1 - t) * (1 - t) * (1 - t);
  pos.x = C1.x * b1 + C2.x * b2 + C3.x * b3 + C4.x * b4;
  pos.y = C1.y * b1 + C2.y * b2 + C3.y * b3 + C4.y * b4;
  return pos;
}

export function getBezierTrajectory(duration: number, p1: Point, p2: Point, p3: Point, p4: Point) {
  let coords: [number, number][] = [];
  for (let i = 0; i < duration; i++) {
    let t = i * (1 / duration);
    let b = getBezier(t, p1, p2, p3, p4);
    coords.push([b.x, b.y]);
  }
  return coords;
}

export function rotatePoint(cx: number, cy: number, angle: number, p: Point) {
  let s = Math.sin(angle);
  let c = Math.cos(angle);
  p.x -= cx;
  p.y -= cy;
  let xnew = p.x * c - p.y * s;
  let ynew = p.x * s + p.y * c;
  p.x = Math.round(xnew + cx);
  p.y = Math.round(ynew + cy);
  return p;
}

/*!	Curve calc function for canvas 2.3.7
 *	(c) Epistemex 2013-2016
 *	www.epistemex.com
 *	License: MIT
 */

/**
 * Calculates an array containing points representing a cardinal spline through given point array.
 * Points must be arranged as: [x1, y1, x2, y2, ..., xn, yn].
 *
 * There must be a minimum of two points in the input array but the function
 * is only useful where there are three points or more.
 *
 * The points for the cardinal spline are returned as a new array.
 */
export function getCurvePoints(
  points: Array<any>,
  tension: number = 0.5,
  numOfSeg: number = 25,
  close: boolean = false
): Float32Array {
  'use strict';
  if (typeof points === 'undefined' || points.length < 2) return new Float32Array(0);
  tension = typeof tension === 'number' ? tension : 0.5;
  numOfSeg = typeof numOfSeg === 'number' ? numOfSeg : 25;
  let pts, // for cloning point array
    i = 1,
    l = points.length,
    rPos = 0,
    rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0),
    res = new Float32Array(rLen),
    cache = new Float32Array((numOfSeg + 2) << 2),
    cachePtr = 4;
  pts = points.slice(0);
  if (close) {
    pts.unshift(points[l - 1]); // insert end point as first point
    pts.unshift(points[l - 2]);
    pts.push(points[0], points[1]); // first point as last point
  } else {
    pts.unshift(points[1]); // copy 1. point and insert at beginning
    pts.unshift(points[0]);
    pts.push(points[l - 2], points[l - 1]); // duplicate end-points
  }
  cache[0] = 1; // 1,0,0,0
  for (; i < numOfSeg; i++) {
    let st = i / numOfSeg,
      st2 = st * st,
      st3 = st2 * st,
      st23 = st3 * 2,
      st32 = st2 * 3;
    cache[cachePtr++] = st23 - st32 + 1; // c1
    cache[cachePtr++] = st32 - st23; // c2
    cache[cachePtr++] = st3 - 2 * st2 + st; // c3
    cache[cachePtr++] = st3 - st2; // c4
  }
  cache[++cachePtr] = 1; // 0,1,0,0
  parse(pts, cache, l, tension);
  if (close) {
    pts = [];
    pts.push(
      points[l - 4],
      points[l - 3],
      points[l - 2],
      points[l - 1], // second last and last
      points[0],
      points[1],
      points[2],
      points[3]
    ); // first and second
    parse(pts, cache, 4, tension);
  }
  function parse(pts, cache, l, tension) {
    for (let i = 2, t; i < l; i += 2) {
      let pt1 = pts[i],
        pt2 = pts[i + 1],
        pt3 = pts[i + 2],
        pt4 = pts[i + 3],
        t1x = (pt3 - pts[i - 2]) * tension,
        t1y = (pt4 - pts[i - 1]) * tension,
        t2x = (pts[i + 4] - pt1) * tension,
        t2y = (pts[i + 5] - pt2) * tension,
        c = 0,
        c1,
        c2,
        c3,
        c4;

      for (t = 0; t < numOfSeg; t++) {
        c1 = cache[c++];
        c2 = cache[c++];
        c3 = cache[c++];
        c4 = cache[c++];

        res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
        res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
      }
    }
  }
  l = close ? 0 : points.length - 2;
  res[rPos++] = points[l++];
  res[rPos] = points[l];
  return res;
}

export function evalInContext(str: string, context: Object) {
  return function(str) {
    let header = 'let {';
    for (const [key, value] of Object.entries(context)) {
      header += key + ',';
    }
    header = header.substr(0, header.length - 1);
    header += '} = context';
    let code = header + '\n' + str;
    return eval(code);
  }.call(context, str);
}

export function loadIcon(iconIndex: number) {
  let bitmap = ImageManager.loadSystem('IconSet');
  let pw = Window_Base._iconWidth;
  let ph = Window_Base._iconHeight;
  let sx = (iconIndex % 16) * pw;
  let sy = Math.floor(iconIndex / 16) * ph;
  let bmpResult = new Bitmap(pw, ph);
  bmpResult.blt(bitmap, sx, sy, pw, ph, 0, 0);
  return bmpResult;
}

/**
 * Pick one event based on its odd of happening.
 * ```javascript
 * let event1 = { name: 'a', odd: 0.8};
 * let event2 = { name: 'b', odd: 0.2};
 * pickRandomEvent([event1, event2]) // event1 is more likely to happen.
 * ```
 */
export function pickRandomEvent(events: { [key: string]: any; odd: number }[]) {
  let p = Math.random();
  let cumulativeP = 0;
  for (const event of events) {
    let { odd } = event;
    cumulativeP += odd * 0.01;
    if (p <= cumulativeP) {
      return event;
    }
  }
  return null;
}

/**
 * Generate points in a circle shape.
 */
export function circlePoints(ox: number, oy: number, radius: number, nbrPoints: number) {
  let points: { x: number; y: number }[] = [];
  let slice = (2 * Math.PI) / nbrPoints;
  for (let i = 0; i < nbrPoints; i++) {
    let angle = slice * i;
    let x = ox + radius * Math.cos(angle);
    let y = oy + radius * Math.sin(angle);
    points.push({ x, y });
  }
  return points;
}

export function getComments(eventObject: any) {
  if (eventObject instanceof Game_Event) {
    return getComments(eventObject.event());
  }
  let comment = '';
  for (const page of eventObject.pages) {
    for (const element of page.list) {
      if (element.code === 108 || element.code === 408) {
        comment += element.parameters.join('\n') + '\n';
      }
    }
  }
  return comment;
}

export function clone(obj: Object) {
  let val = {};
  for (let i in obj) {
    if (obj[i] != null && typeof obj[i] == 'object') val[i] = clone(obj[i]);
    else val[i] = obj[i];
  }
  return val;
}
