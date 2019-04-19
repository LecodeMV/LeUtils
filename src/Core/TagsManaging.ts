
/**
 * ## A complex and complete module to parse and evaluate notetags of RPG Maker MV data objects.
 *
 * Given the following notetags:  
 * *Actor*
 * ```
 * <my_tag>
 * gold_gain_per_step: 10
 * gold_gain_per_step+: 15
 * storage_size: 50
 * pet_name: Botan
 * passive: Power I, Self-Healing II
 * <bio>
 * I am a simple adventurer.
 * </bio>
 * </my_tag>
 * 
 * title: Hero
 * ```
 *
 * *Armor equiped by actor*
 * ```
 * <my_tag>
 * storage_size+: 20
 * gold_gain_per_step: 500
 * </my_tag>
 * ```
 *
 * *Affected state on actor*
 * ```
 * <my_tag>
 * storage_size%: 30
 * passive+: Counter III
 * </my_tag>
 * ```
 *
 * This module allow to interpret the notetags values of this actor, factoring his equipped gear and states.
 * When parsing and interpreting the values of these notetags, this module follow the following rules:
 * * Base values are overwritten according to this priority list: State > Equipment > Class > Battler.
 * * `+` is used to add raw values and `%` to modify the final value by a percentage.
 *
 * ### Example
 * ```javascript
 * let tag = tags(actor);
 * let getter = tag.get();
 * 
 * let title = await getter.title(); // Hero
 * 
 * let my_tag = await getter.my_tag();
 * let goldGainPerStep = await myTag.gold_gain_per_step(); // 515
 * let storageSize = await myTag.storage_size(); // (50 + 20) * 1.3 = 91
 * let passive = await myTag.passive(); // Power I, Self-Healing II, Counter III
 * let bio = await myTag.bio(); // I am a simple adventurer.
 * ```
 *
 * Note how all the getters used are asynchronous. That is because any value
 * of a notetag can be evaluated as a script, and be given a context.
 * See the following example.
 *
 * ### Evaluating notetags
 * Let's say our actor notetags content is now the following:
 *
 * ```
 * <my_tag>
 * <!storage_size>
 * return 50 + context.a;
 * </storage_size>
 * <!pet_name>
 * return context.title + ' Botan';
 * </pet_name>
 * </my_tag>
 * ```
 * These values can be obtained as such:
 * ```javascript
 * let tag = tags(actor);
 * let getter = tag.get();
 * let my_tag = await getter.my_tag();
 *
 * let storageSize = await myTag.storage_size({ a: 100 }); // (100 + 20) * 1.3 = 91
 * let petName = await myTag.pet_name({ title: 'Corrupted'}); // Corrupted Botan
 * ```
 * 
 * ### Chaining
 * When interacting with `tags`, it's possible to chain its properties.
 * ```javascript
 * let tag = tags(actor);
 *
 * let storageSize = await tag.get().my_tag().storage_size({ a: 100 });
 * ```
 * 
 * ### Watching changes
 * It is possible to watch changes when a value is altered, for example
 * when a battler's equipment change or when his states changes.
 * 
 * ```javascript
 * let tag = tags(actor);
 * let watcher = tag.watch();
 *
 * await watcher.my_tag().storage_size({ a: 100 }, (tagResult: any, beforeValue: any, afterValue: any) => {
 *  // Do something with arguments
 *  return false; // Return true to dispose of the watcher
 * });
 * ```
 * 
 * ### Collecting values
 * Finally, it's possible to get all the values of a specific tag or property based on the battler's class,
 * gear, states, etc.
 * 
 * Given the following notetags:  
 * *Actor*
 * ```
 * title: Hero
 * ```
 *
 * *Armor equiped by actor*
 * ```
 * <my_tag>
 * storage_size+: 20
 * </my_tag>
 * 
 * title: Shadow
 * ```
 *
 * *Affected state on actor*
 * ```
 * <my_tag>
 * storage_size+: 50
 * </my_tag>
 * 
 * title: Oracle
 * ```
 * 
 * Values can be collected as such:
 * 
 * ```javascript
 * let tag = tags(actor);
 * let collector = tag.collect();
 *
 * let allPocketSizeAdditions = await collector.my_tag().storage_sizePlus(); // [20, 50]
 * let allTitles = await collector.title(); // ['Hero', 'Shadow',' Oracle]
 * ```
 * 
 * ### Typings
 * When used on a TypeSccript project, it is possible to get full typings of the `tags`
 * when using a [UrdModelItem] as a generic type.
 * 
 * ```ts
 * let tag = tags<MyTagItem>(actor);
 * 
 * tag.gold(); // TypeError: Cannot find 'gold' of MyTagItem
 * ```
 * 
 * @module TagsManaging
 */

 /** */
import {
  UrdRepository,
  Model,
  Chainable,
  UrdUtils,
  ModelPattern,
  Urd,
  ModelField
} from '@urd/core';
import { Game_Battler, Game_Enemy, RPGObject, DataActor, DataEnemy } from 'mv-lib';


/**
 *
 */
const symbol = Symbol();

export function tags<T = any>(obj: RPGObject | Game_Battler, model: Model): TagResult<T> {
  if (obj[symbol]) {
    return obj[symbol];
  }
  return (obj[symbol] = makeTagResult<T>(obj, model));
}

function makeTagResult<T>(obj: RPGObject | Game_Battler, model: Model) {
  let rpgObject: DataActor | DataEnemy = obj as any;
  if (obj instanceof Game_Battler) {
    rpgObject = obj.isActor() ? obj.actor() : (obj as Game_Enemy).enemy();
  }
  const note = noteToValidUrdText(rpgObject.note);
  const repository = new UrdRepository<T>(model, 'notetag');
  repository.set('item', note);
  return new TagResult<T>(repository, rpgObject, obj instanceof Game_Battler ? obj : null, model);
}

function noteToValidUrdText(note: string) {
  return note.replace(/^\s*\b(\S+)([\+\%])\:/gim, (match, word, op) => {
    if (word.match(/(.+)\((.+)\)/i)) {
      return `${RegExp.$1}${op === '+' ? 'Plus' : 'Rate'}(${RegExp.$2}):`;
    }
    return `${word}${op === '+' ? 'Plus' : 'Rate'}:`;
  });
}

export type Watcher<T> = (tagResult: TagResult<T>, beforeValue: any, afterValue: any) => boolean;
export declare type Watchable<T> = {
  [P in keyof T]: T[P] extends (...args: any) => any
    ? (context?: Object, watcher?: Watcher<T>, id?: string) => Watchable<ReturnType<T[P]>>
    : never
};
export class WatcherHandler<T> {
  tagResult: TagResult<T>;
  watcher: Watcher<T>;
  oldValue: any;
  path: string;
  contexts: Object[];

  constructor(tagResult: TagResult<T>, watcher: Watcher<T>, path: string, contexts: Object[]) {
    this.tagResult = tagResult;
    this.watcher = watcher;
    this.path = path;
    this.contexts = contexts;
  }

  async check() {
    let value = await this.tagResult.getFromPath(this.path.split('.'), this.contexts);
    if (value !== this.oldValue) {
      this.watcher(this.tagResult, this.oldValue, value);
      this.oldValue = value;
    }
  }
}
const oldRefresh = Game_Battler.prototype.refresh;
Game_Battler.prototype.refresh = function() {
  oldRefresh.call(this);
  let rpgObject: DataActor | DataEnemy = this.isActor()
    ? this.actor()
    : (this as Game_Enemy).enemy();
  let tag: TagResult<any> = rpgObject[symbol];
  if (tag) {
    tag.checkWatchers();
  }
};

type ArgumentTypes<T> = T extends (...args: infer U) => infer R ? U : never;
type ReplaceReturnType<T, TNewReturn> = (...a: ArgumentTypes<T>) => TNewReturn;
type Collectable<T> = Array<T> & T;
type CollectableWrapper<T> = {
  [P in keyof T]: T[P] extends (...args: any) => any
    ? ReplaceReturnType<T[P], Collectable<CollectableWrapper<ReturnType<T[P]>>>>
    : T[P]
};
const Adapted = '__$$';
export class TagResult<T> {
  repository: UrdRepository<T>;
  rpgObject: RPGObject;
  battler: Game_Battler;
  model: Model;
  patterns: ModelPattern[];
  watcherHandlers: { [id: string]: WatcherHandler<T> } = {};

  constructor(
    repository: UrdRepository<T>,
    rpgObject: RPGObject,
    battler: Game_Battler,
    model: Model
  ) {
    this.repository = repository;
    this.rpgObject = rpgObject;
    this.battler = battler;
    this.model = model;
    this.patterns = Urd.makePatterns(model);
    this._adaptModel();
  }

  _adaptModel(obj: Model = this.model) {
    if (obj[Adapted]) return;
    for (const [key, value] of Object.entries(obj)) {
      if (value.type === 'number' || value.type === 'map') {
        obj[key + 'Plus'] = value;
        obj[key + 'Rate'] = value;
      } else if (['string', 'list', 'text'].includes(value.type)) {
        obj[key + 'Plus'] = value;
      } else if (value.type === 'structure') {
        this._adaptModel(value.fields);
      }
    }
    //@ts-ignore
    obj[Adapted] = true;
  }

  exists(value: any) {
    return this.repository.exists(value);
  }

  get(context?: Object): Chainable<T> {
    const item = this.raw(context);
    return UrdUtils.proxymise(this._makeGetProxy(item));
  }

  _makeGetProxy(item: Object, path = []) {
    return new Proxy(item as any, {
      get: (target, p) => {
        if (typeof p === 'symbol') {
          return target;
        }
        if (p === 'then') {
          return target.then ? target.then.bind(target) : Promise.resolve(target);
        }
        if (typeof p === 'string') {
          const pathStr = ['__root__', ...path].join('.');
          const pattern = this.patterns.find(pat => pat.id === p && pat.path === pathStr);
          if (!pattern) {
            throw new Error(`Can't find ${p} in the model. Path is ${pathStr}`);
          }
          return async (options: any) => {
            let mainValue = await this._getMainValue(target, p, [...path, p], pattern, options);
            switch (pattern.type) {
              case 'structure':
                return this._makeGetProxy(mainValue, [...path, p]);
              case 'number':
                let numberValue = Number(mainValue);
                let plusValues = await this._getAllValues(
                  target,
                  p + 'Plus',
                  [...path, p + 'Plus'],
                  options
                );
                let rateValues = await this._getAllValues(
                  target,
                  p + 'Rate',
                  [...path, p + 'Rate'],
                  options
                );
                let plusSum = plusValues.reduce((acc, curr) => (acc += curr), 0);
                let rateSum = rateValues.reduce((acc, curr) => (acc += curr), 0) * 0.01;
                let finalValue = (numberValue + plusSum) * (1 + rateSum);
                return finalValue;
              case 'string':
              case 'list':
              case 'text':
                plusValues = await this._getAllValues(
                  target,
                  p + 'Plus',
                  [...path, p + 'Plus'],
                  options
                );
                return []
                  .concat(mainValue, plusValues)
                  .filter(v => !!v)
                  .join(',');
              case 'map':
                let allMaps = await this._getAllValues(target, p, [...path, p], options);
                let plusMaps = await this._getAllValues(
                  target,
                  p + 'Plus',
                  [...path, p + 'Plus'],
                  options
                );
                let rateMaps = await this._getAllValues(
                  target,
                  p + 'Rate',
                  [...path, p + 'Rate'],
                  options
                );
                let baseMap = allMaps.reduce((acc, curr) => {
                  for (const [key, value] of Object.entries(curr)) {
                    if (!acc[key]) acc[key] = curr[key];
                  }
                  return acc;
                }, {});
                let plusMap = plusMaps.reduce((acc, curr) => {
                  for (const [key, value] of Object.entries(curr)) {
                    let val = curr[key];
                    if (!isNaN(Number(val))) {
                      if (!acc[key]) acc[key] = 0;
                      acc[key] += Number(val);
                    } else {
                      if (!acc[key]) acc[key] = '';
                      acc[key] = []
                        .concat(acc[key].split(','), val)
                        .filter(v => !!v)
                        .join(',');
                    }
                  }
                  return acc;
                }, {});
                let rateMap = rateMaps.reduce((acc, curr) => {
                  for (const [key, value] of Object.entries(curr)) {
                    let val = curr[key];
                    if (!isNaN(Number(val))) {
                      if (!acc[key]) acc[key] = 0;
                      acc[key] += Number(val);
                    } else {
                      if (!acc[key]) acc[key] = '';
                      acc[key] = []
                        .concat(acc[key].split(','), val)
                        .filter(v => !!v)
                        .join(',');
                    }
                  }
                  return acc;
                }, {});

                let allKeys = [
                  ...new Set(
                    [].concat(Object.keys(baseMap), Object.keys(plusMap), Object.keys(rateMap))
                  )
                ];
                let obj = {};
                for (const key of allKeys) {
                  let base = baseMap[key];
                  let plus = plusMap[key];
                  let rate = rateMap[key];
                  if (!isNaN(Number(base)) || !isNaN(Number(plus)) || !isNaN(Number(rate))) {
                    obj[key] =
                      (Number(base || 0) + Number(plus || 0)) * (1 + Number(rate || 0) * 0.01);
                  } else {
                    obj[key] = []
                      .concat((base || '').split(','), (plus || '').split(','))
                      .filter(v => !!v)
                      .join(',');
                  }
                }
                return obj;
              case 'code':
                return mainValue;
              default:
                throw new Error('Unhandled type');
            }
          };
        }
        return target[p];
      }
    });
  }

  collect(context?: Object): CollectableWrapper<Chainable<T>> {
    const item = this.raw(context);
    return UrdUtils.proxymise(this._makeCollectProxy(item));
  }

  _makeCollectProxy(item: Object, path = []) {
    return new Proxy(item as any, {
      get: (target, p) => {
        if (typeof p === 'symbol') {
          return target;
        }
        if (p === 'then') {
          return target.then ? target.then.bind(target) : Promise.resolve(target);
        }
        if (typeof p === 'string') {
          // Calling a method from Array
          if ([][p] != null) return target[p];

          const pathStr = ['__root__', ...path].join('.');
          const pattern = this.patterns.find(pat => pat.id === p && pat.path === pathStr);
          if (!pattern) {
            throw new Error(`Can't find ${p} in the model. Path is ${pathStr}`);
          }
          return async (options: any) => {
            let values = await this._getAllValues(target, p, [...path, p], options);
            switch (pattern.type) {
              case 'structure':
                return this._makeCollectProxy(values, [...path, p]);
              case 'number':
              case 'string':
              case 'list':
              case 'text':
              case 'map':
              case 'code':
                return values;
              default:
                throw new Error('Unhandled type');
            }
          };
        }
        return target[p];
      }
    });
  }

  raw(context?: Object) {
    return this.repository.interpret('item', context);
  }

  watch(): Watchable<Chainable<T>> {
    const item = this.raw();
    return UrdUtils.proxymise(this._makeWatcherProxy(item));
  }

  _makeWatcherProxy(item: Object, path = [], contexts = []) {
    return new Proxy(item as any, {
      get: (target, p) => {
        if (typeof p === 'symbol') {
          return target;
        }
        if (p === 'then') {
          return target.then ? target.then.bind(target) : Promise.resolve(target);
        }
        if (typeof p === 'string') {
          const pathStr = ['__root__', ...path].join('.');
          const pattern = this.patterns.find(pat => pat.id === p && pat.path === pathStr);
          if (!pattern) {
            throw new Error(`Can't find ${p} in the model. Path is ${pathStr}`);
          }
          return (context = {}, watcher?: Watcher<T>, id: string = '1') => {
            this.registerWatcher(watcher, [...path, p].join('.'), id, [...contexts, context]);
            switch (pattern.type) {
              case 'structure':
                return this._makeWatcherProxy({}, [...path, p], [...contexts, context]);
              case 'number':
              case 'string':
              case 'list':
              case 'text':
              case 'map':
              case 'code':
                return null;
              default:
                throw new Error('Unhandled type');
            }
          };
        }
        return target[p];
      }
    });
  }

  registerWatcher<T = any>(watcher: Watcher<T>, path: string, id: string, contexts: Object[]) {
    if (!watcher) {
      delete this.watcherHandlers[id];
      return;
    }
    this.watcherHandlers[id] = new WatcherHandler<any>(this, watcher, path, contexts);
  }

  checkWatchers() {
    for (const [key, watcherHandler] of Object.entries(this.watcherHandlers)) {
      watcherHandler.check();
    }
  }

  async rawFromPath(path: string[], options: any) {
    let obj = this.raw();
    for (const str of path) {
      if (!obj || !this.exists(obj)) return null;
      if (!obj[str]) return null;
      if (!(typeof obj[str] === 'function')) return null;
      obj = await obj[str](options);
    }
    return obj;
  }

  async getFromPath(path: string[], optionArray: any[]) {
    let getter = this.get();
    let value = getter;
    for (const [i, str] of Object.entries(path)) {
      if (!value || !this.exists(value)) return null;
      if (!value[str]) return null;
      if (!(typeof value[str] === 'function')) return null;
      value = await value[str]({ context: optionArray[i] || {} });
    }
    return value;
  }

  async _getMainValue(
    item: Object,
    prop: string,
    path: string[],
    pattern: ModelPattern,
    options: any
  ) {
    let defaultValue = this._getDefaultValue(pattern);
    if (this.battler) {
      let rpgObjects = []
        .concat(this._getInventory(), [
          this.battler.isActor() ? this.battler.actor() : (this.battler as Game_Enemy).enemy()
        ])
        .filter(v => !!v);
      for (const obj of rpgObjects) {
        let tag = tags(obj, this.model);
        let value = await tag.rawFromPath(path, options);
        if (value != null) return value;
      }
      return defaultValue;
    }
    return this.rawFromPath(path, options) || defaultValue;
  }

  async _getAllValues(item: Object, prop: string, path: string[], options) {
    const values = [];
    if (this.battler) {
      let rpgObjects = []
        .concat(this._getInventory(), [
          this.battler.isActor() ? this.battler.actor() : (this.battler as Game_Enemy).enemy()
        ])
        .filter(v => !!v);
      for (const obj of rpgObjects) {
        let tag = tags(obj, this.model);
        let value = await tag.rawFromPath(path, options);
        if (value != null) values.push(value);
      }
      return values;
    }
    let raw = this.rawFromPath(path, options);
    return raw ? [raw] : [];
  }

  _getInventory() {
    if (this.battler) {
      return [] //[battler._itemOnUse]
        .concat(this.battler.states())
        .concat(
          this.battler.isActor() ? this.battler.equips().concat([this.battler.currentClass()]) : []
        );
    }
    return [];
  }

  _makeStructureDefaultValue(pattern: ModelPattern) {
    let obj = {};
    for (const [key, value] of Object.entries(pattern.fields)) {
      obj[key] = this._getDefaultValue(value);
    }
    return obj;
  }

  _getDefaultValue(pattern: ModelPattern | ModelField) {
    let defaultValue = pattern.default as any;
    if (!defaultValue) {
      switch (pattern.type) {
        case 'structure':
          defaultValue = this._makeStructureDefaultValue(pattern as ModelPattern);
        case 'number':
          defaultValue = '0';
          break;
        case 'string':
        case 'list':
        case 'code':
          defaultValue = '';
          break;
        case 'map':
          defaultValue = {};
          break;
      }
    }
    return defaultValue;
  }
}
