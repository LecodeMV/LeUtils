/**
 * ## A complex and complete module to parse and evaluate notetags of RPG Maker MV data objects.
 *
 * Let's say we have the following notetags:
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
 * *Armor equipped by actor*
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
 * * `+` suffix to a notetag is used to add raw values and `%` to modify the final value by a percentage.
 * 
 * ### Supporting TypeScript
 * 
 * The first thing to do before exploiting this module, is to define a Urd Model for your
 * notetags.
 * 
 * **myModel.urd-model.ts**
 * ```js
 * import { Model } from '@urd/core';
 * 
 * export const myModel: Model = {
 *  title: {
 *    type: 'string'
 *  },
 *  my_tag: {
 *    type: 'structure',
 *    fields: {
 *      gold_gain_per_step: {
 *        type: 'number',
 *      },
 *      storage_size: {
 *        type: 'number'
 *      },
 *      pet_name: {
 *        type: 'string'
 *      },
 *      passive: {
 *        type: 'list'
 *      },
 *      bio: {
 *        type: 'text'
 *      }
 *    }
 *  }
 * };
 * 
 * export default myModel;
 * ```
 * 
 * This model allows LeUtils to leverage TypeScript and provide top
 * class type definitions when using this module.
 * 
 * The next step is to generate the type definition from this model using Urd CLI:
 * ```bash
 * urd g i
 * ```
 * This will create a `myModel.urd-item.ts` in the same folder as `myModel.urd-model.ts`
 * 
 * Now that we have the notetags data and the model that reflect their structure,
 * we can use this module to extract any tag and value we want.
 *
 * ### Example
 * ```ts
 * import myModel from './tags/test.urd-model';
 * import { tags } from 'leutils';
 * import { MyModelItem, MyModelItemProps } from './tags/test.urd-item';
 * 
 * let tag = tags<MyModelItem, MyModelItemProps>(actor, myModel);
 * ```
 * 
 * Up to this point, there are two ways to exploit the `tag` object.
 * 
 * #### Chaining
 * ```ts
 * let getter = tag.getter();
 *
 * let title = await getter.title(); // Hero
 *
 * let myTag = await getter.my_tag();
 * let goldGainPerStep = await myTag.gold_gain_per_step(); // 515
 * let storageSize = await myTag.storage_size(); // (50 + 20) * 1.3 = 91
 * let passive = await myTag.passive(); // Power I, Self-Healing II, Counter III
 * let bio = await myTag.bio(); // I am a simple adventurer.
 * 
 * let goldGainPerStep2 = await getter.my_tag().gold_gain_per_step(); // This works too
 * ```
 * 
 * #### Magic String version
 * Note that auto-completion is provided for these strings.
 * ```ts
 * let title = await tag.get('title'); // Hero
 *
 * let myTag = await tag.get('my_tag');
 * let goldGainPerStep = await tag.get('my_tag.gold_gain_per_step'); // 515
 * let storageSize = await tag.get('my_tag.storage_size'); // (50 + 20) * 1.3 = 91
 * let passive = await tag.get('my_tag.passive'); // Power I, Self-Healing II, Counter III
 * let bio = await tag.get('my_tag.bio'); // I am a simple adventurer.
 * ```
 * 
 *
 * Note how all the getters used are asynchronous. That is because any value
 * of a notetag can be evaluated as a script, and be given a context:
 *
 * ### Evaluating notetags
 * Let's say our actor notetags content is now the following, without any addition tag from states
 * or gear:
 *
 * ```
 * <my_tag>
 * <!storage_size>
 * return 50 + context.a;
 * </storage_size>
 * 
 * <!pet_name>
 * return context.title + ' Botan';
 * </pet_name>
 * </my_tag>
 * ```
 * These values can be obtained as such:
 * 
 * #### First Version
 * ```ts
 * let getter = tag.getter();
 * let myTag = await getter.my_tag(); // No context passed here
 * // It's the same as:
 * myTag = await getter.my_tag({}); // Empty context
 *
 * let storageSize = await myTag.storage_size({ a: 100 }); // 150
 * let petName = await myTag.pet_name({ title: 'Corrupted'}); // Corrupted Botan
 * ```
 * 
 * #### Second Version
 * ```ts
 * let myTag = await tag.get('my_tag'); // No context passed here
 * // It's the same as:
 * let myTag = await tag.get('my_tag', {});
 *
 * let storageSize = await tag.get('my_tag.storage_size', {}, { a: 100 }); // 150
 * // The first parameter after the property string is the context for evaluating 'my_tag'
 * 
 * let petName = await tag.get('my_tag.pet_name', {}, { title: 'Corrupted'}); // Corrupted Botan
 * ```
 * 
 * ### Collecting values
 * Additionally, this module let you collect all the defined values of a tag within the battler's notetags 
 * and his states and gear.
 * 
 * Let's say we have the following notetags:
 * *Actor*
 * ```
 * <my_tag>
 * gold_gain_per_step: 10
 * gold_gain_per_step%: 200
 * </my_tag>
 * 
 * title: Hero
 * ```
 *
 * *Armor equipped by actor*
 * ```
 * <my_tag>
 * gold_gain_per_step: 15
 * gold_gain_per_step+: 100
 * </my_tag>
 * 
 * title: Shadow
 * ```
 * These notetags can be collected this way:
 * ```ts
 * let allGoldGainPerSteps = await tag.collect('my_tag.gold_gain_per_step'); // [10, 15]
 * let allGoldGainPerStepPlusValues = await tag.collect('my_tag.gold_gain_per_step+'); // [100]
 * let allGoldGainPerStepRates = await tag.collect('my_tag.gold_gain_per_step%'); // [200]
 * 
 * // Alternative version:
 * let collector = tag.collector();
 * let allTitles = await collector.title(); // ['Hero', 'Shadow']
 * let allGoldGainPerSteps2 = await collector.my_tag().gold_gain_per_step(); // [10, 15]
 * let allGoldGainPerStepsPlusValues2 = await collector.my_tag().gold_gain_per_stepPlus(); // [100]
 * ```
 *
 * ### Watching changes
 * It is possible to watch changes when a value is altered, for example
 * when a battler's equipment change or when his states change.
 *
 * ```ts
 * let tag = tags(actor);
 * 
 * // Observe a single value
 * let observable = tag.observable('my_tag.gold_gain_per_step', 0); // Default value is 0
 * // You have to register a function that return a context for each property
 * observable.onGetContext((prop: string) => {
 *  switch (prop) {
 *    case 'gold_gain_per_step': return { a: 100};
 *    default: return {};
 *  }
 * });
 * observable.onChange((tag, beforeValue, afterValue) => {
 *  // A change has been detected here
 * });
 * // Don't forget to dispose of the observable when it is no more needed
 * observable.dispose();
 * ```
 * 
 * #### Watching any or all chances
 * It's possible to react to any or all changes within a set of notetags.
 * ```ts
 * let goldGainObservable = tag.observable('my_tag.gold_gain_per_step', 0);
 * // initialize the observable...
 * 
 * let titleObservable = tag.observable('title', 0);
 * // initialize the observable...
 * 
 * // Watch any change
 * let anyObservable = tag.observeAny([goldGainObservable, titleObservable], (tag) => {
 *  // either the value of 'gold_gain_per_step' or 'title' changed
 * });
 * 
 * // Watch any change
 * let allObservable = tag.observeAll([goldGainObservable, titleObservable], (tag) => {
 *  // all values changed since the last iteration
 * });
 * 
 * // These observables can be disposed as well
 * anyObservable.dispose();
 * allObservable.dispose();
 * 
 * // Bulk observables can even be used within another observable:
 * let observableCeption = tag.observeAll([anyObservable1, anyObservable2], (tag) => {
 *  
 * });
 * 
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
import { Game_Battler, Game_Enemy, RPGObject, DataActor, DataEnemy, DataSkill } from 'mv-lib';

/**
 *
 */
const symbol = Symbol();

export function tags<T = any, TProp = any>(
  obj: RPGObject | Game_Battler,
  model: Model
): TagResult<T, TProp> {
  if (obj[symbol]) {
    return obj[symbol];
  }
  return (obj[symbol] = makeTagResult<T, TProp>(obj, model));
}

function makeTagResult<T, TProp>(obj: RPGObject | Game_Battler, model: Model) {
  let rpgObject: DataActor | DataEnemy = obj as any;
  if (obj instanceof Game_Battler) {
    rpgObject = obj.isActor() ? obj.actor() : (obj as Game_Enemy).enemy();
  }
  const note = noteToValidUrdText(rpgObject.note);
  const repository = new UrdRepository<T>(model, 'notetag');
  repository.set('item', note);
  return new TagResult<T, TProp>(
    repository,
    rpgObject,
    obj instanceof Game_Battler ? obj : null,
    model
  );
}

function noteToValidUrdText(note: string) {
  return note.replace(/^\s*\b(\S+)([\+\%])\:/gim, (match, word, op) => {
    if (word.match(/(.+)\((.+)\)/i)) {
      return `${RegExp.$1}${op === '+' ? 'Plus' : 'Rate'}(${RegExp.$2}):`;
    }
    return `${word}${op === '+' ? 'Plus' : 'Rate'}:`;
  });
}

export type Watcher<T> = (tagResult: TagResult<T>, beforeValue: any, afterValue: any) => void;
export type LesserWatcher<T> = (tagResult: TagResult<T>) => void;
export declare type Watchable<T> = {
  [P in keyof T]: T[P] extends (...args: any) => any
    ? (context?: Object, watcher?: Watcher<T>, id?: string) => Watchable<ReturnType<T[P]>>
    : never
};

export class TagObservable<T, TProp> {
  watcher: Watcher<T>;
  oldValue: TProp;
  contextGetter: (property: string) => Object;
  constructor(
    public tagResult: TagResult<T>,
    public path: string,
    iniValue: TProp,
    public id: string
  ) {
    this.oldValue = iniValue;
  }

  onGetContext(func: (property: string) => Object) {
    this.contextGetter = func;
  }

  onChange(watcher: Watcher<T>) {
    this.watcher = watcher;
  }

  dispose() {
    this.tagResult.removeObservable(this);
  }

  async check() {
    let contexts = this._getContexts();
    let value = ((await this.tagResult._getFromPath(
      this.path.split('.'),
      contexts
    )) as any) as TProp;
    if (value !== this.oldValue) {
      this.watcher(this.tagResult, this.oldValue, value);
      this.oldValue = value;
      return true;
    }
    return false;
  }

  _getContexts() {
    return this.path.split('.').map(str => this.contextGetter(str));
  }
}

export class TagsBulkObservable<T, TProp> extends TagObservable<T, TProp> {
  watcher: LesserWatcher<T>;
  strategy: 'any' | 'all';
  children: TagObservable<T, TProp>[] = [];

  async check(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let promises = this.children.map(c => c.check());
      switch (this.strategy) {
        case 'any':
          let resolved = false,
            resolvedNbr = 0;
          const onValue = (value: boolean) => {
            resolvedNbr++;
            if (resolved) return;
            if (value) {
              resolved = true;
              this.watcher(this.tagResult);
              resolve(true);
            } else if (resolvedNbr === promises.length) {
              resolve(false);
            }
          };
          for (const promise of promises) {
            promise.then(onValue);
          }
          break;

        case 'all':
          Promise.all(promises).then(() => {
            this.watcher(this.tagResult);
            resolve(true);
          });
      }
      return false;
    });
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
    tag.checkObservables();
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
type UnPromisify<T> = T extends Promise<infer U> ? U : T;

const Adapted = '__$$';
export class TagResult<T, TProp = any> {
  repository: UrdRepository<T>;
  rpgObject: RPGObject;
  battler: Game_Battler;
  model: Model;
  patterns: ModelPattern[];
  cachedResults: { [key: string]: CachedTagResult } = {};
  observables: { [id: string]: TagObservable<T, TProp> } = {};

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

  getter(context?: Object): Chainable<T> {
    const item = this.raw(context);
    return UrdUtils.proxymise(this._makeGetProxy(item));
  }

  get<I extends TProp, K extends keyof TProp>(path: K, ...contextArr: Object[]): I[K] {
    return this._getFromPath(
      path.toString().split('.'),
      contextArr.map(context => {
        return { context };
      })
    ) as any;
  }

  _makeGetProxy(item: Object, path = [], optionArray = []) {
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
            // Does not make any significant improvement.

            // let key = [...path, p, 'get'].join('.');
            // let cachedResult =
            //   this.cachedResults[key] || new CachedTagResult(this, [...path, p], 'get');
            // if (cachedResult.isUpdated()) {
            //   return cachedResult.value;
            // }

            let mainValue = await this._getMainValue(target, p, [...path, p], pattern, options);
            switch (pattern.type) {
              case 'structure':
                return this._makeGetProxy(mainValue, [...path, p], [...optionArray, options]);
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

  collector(context?: Object): CollectableWrapper<Chainable<T>> {
    const item = this.raw(context);
    return UrdUtils.proxymise(this._makeCollectProxy(item));
  }

  collect<I extends TProp, K extends keyof TProp>(path: K, ...contextArr: Object[]): I[K] {
    return this._collectFromPath(
      path.toString().split('.'),
      contextArr.map(context => {
        return { context };
      })
    ) as any;
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

  observable<I extends TProp, K extends keyof TProp>(path: K, iniValue?: UnPromisify<I[K]>) {
    let id = Object.keys(this.observables).length;
    let obs = new TagObservable<T, TProp>(this, path as string, iniValue as any | null, String(id));
    return (this.observables[String(id)] = obs);
  }

  observeAny<K, KProp>(obsArr: TagObservable<K, KProp>[], watcher: LesserWatcher<T>) {
    let id = Object.keys(this.observables).length;
    let obs = new TagsBulkObservable<K, KProp>(this as any, '', null, String(id));
    obs.children = obsArr;
    obs.strategy = 'any';
    obs.onChange(watcher as any);
    //@ts-ignore
    return (this.observables[String(id)] = obs);
  }

  observeAll<K, KProp>(obsArr: TagObservable<K, KProp>[], watcher: LesserWatcher<T>) {
    let id = Object.keys(this.observables).length;
    let obs = new TagsBulkObservable<K, KProp>(this as any, '', null, String(id));
    obs.children = obsArr;
    obs.strategy = 'all';
    obs.onChange(watcher as any);
    //@ts-ignore
    return (this.observables[String(id)] = obs);
  }

  removeObservable(obs: TagObservable<T, TProp>) {
    delete this.observables[String(obs.id)];
  }

  checkObservables() {
    for (const obs of Object.values(this.observables)) {
      obs.check();
    }
  }

  // watch(): Watchable<Chainable<T>> {
  //   const item = this.raw();
  //   return UrdUtils.proxymise(this._makeWatcherProxy(item));
  // }

  // _makeWatcherProxy(item: Object, path = [], contexts = []) {
  //   return new Proxy(item as any, {
  //     get: (target, p) => {
  //       if (typeof p === 'symbol') {
  //         return target;
  //       }
  //       if (p === 'then') {
  //         return target.then ? target.then.bind(target) : Promise.resolve(target);
  //       }
  //       if (typeof p === 'string') {
  //         const pathStr = ['__root__', ...path].join('.');
  //         const pattern = this.patterns.find(pat => pat.id === p && pat.path === pathStr);
  //         if (!pattern) {
  //           throw new Error(`Can't find ${p} in the model. Path is ${pathStr}`);
  //         }
  //         return (context = {}, watcher?: Watcher<T>, id: string = '1') => {
  //           this.registerWatcher(watcher, [...path, p].join('.'), id, [...contexts, context]);
  //           switch (pattern.type) {
  //             case 'structure':
  //               return this._makeWatcherProxy({}, [...path, p], [...contexts, context]);
  //             case 'number':
  //             case 'string':
  //             case 'list':
  //             case 'text':
  //             case 'map':
  //             case 'code':
  //               return null;
  //             default:
  //               throw new Error('Unhandled type');
  //           }
  //         };
  //       }
  //       return target[p];
  //     }
  //   });
  // }

  // registerWatcher<T = any>(watcher: Watcher<T>, path: string, id: string, contexts: Object[]) {
  //   if (!watcher) {
  //     delete this.watcherHandlers[id];
  //     return;
  //   }
  //   this.watcherHandlers[id] = new WatcherHandler<any>(this, watcher, path, contexts);
  // }

  // checkWatchers() {
  //   for (const [key, watcherHandler] of Object.entries(this.watcherHandlers)) {
  //     watcherHandler.check();
  //   }
  // }

  async _rawFromPath(path: string[], options: any) {
    let obj = this.raw();
    for (const str of path) {
      if (!obj || !this.exists(obj)) return null;
      if (!obj[str]) return null;
      if (!(typeof obj[str] === 'function')) return null;
      obj = await obj[str](options);
    }
    return obj;
  }

  async _getFromPath(path: string[], optionArray: any[]) {
    let getter = this.getter();
    let value = getter;
    for (const [i, str] of Object.entries(path)) {
      if (!value || !this.exists(value)) return null;
      if (!value[str]) return null;
      if (!(typeof value[str] === 'function')) return null;
      value = await value[str](optionArray[i] || { context: {} });
    }
    return value;
  }

  async _collectFromPath(path: string[], optionArray: any[]) {
    let collector = this.collector();
    let value = collector;
    for (const [i, str] of Object.entries(path)) {
      if (!value || !this.exists(value)) return null;
      if (!value[str]) return null;
      if (!(typeof value[str] === 'function')) return null;
      value = await value[str](optionArray[i] || { context: {} });
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
        .concat(this.getInventory(), [
          this.battler.isActor() ? this.battler.actor() : (this.battler as Game_Enemy).enemy()
        ])
        .filter(v => !!v);
      for (const obj of rpgObjects) {
        let tag = tags(obj, this.model);
        let value = await tag._rawFromPath(path, options);
        if (value != null) return value;
      }
      return defaultValue;
    }
    return this._rawFromPath(path, options) || defaultValue;
  }

  async _getAllValues(item: Object, prop: string, path: string[], options) {
    const values = [];
    if (this.battler) {
      let rpgObjects = []
        .concat(this.getInventory(), [
          this.battler.isActor() ? this.battler.actor() : (this.battler as Game_Enemy).enemy()
        ])
        .filter(v => !!v);
      for (const obj of rpgObjects) {
        let tag = tags(obj, this.model);
        let value = await tag._rawFromPath(path, options);
        if (value != null) values.push(value);
      }
      return values;
    }
    let raw = this._rawFromPath(path, options);
    return raw ? [raw] : [];
  }

  getInventory(): RPGObject[] {
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

export class CachedTagResult {
  tagResult: TagResult<any>;
  path: string[];
  operation: 'get' | 'collect';
  inventoryIds: number[];
  _value: any;
  constructor(tagResult: TagResult<any>, path: string[], operation: 'get' | 'collect') {
    this.tagResult = tagResult;
    this.path = path;
    this.operation = operation;
    this.inventoryIds = this._makeInventoryIds();
  }

  _makeInventoryIds() {
    let battler = this.tagResult.battler;
    if (!battler) return [];
    return this.tagResult
      .getInventory()
      .filter(v => !!v)
      .map(v => v.id);
  }

  isUpdated() {
    let newIds = this._makeInventoryIds();
    if (newIds != this.inventoryIds) {
      this.inventoryIds = newIds;
      return false;
    }
    return true;
  }

  get value() {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
  }
}
