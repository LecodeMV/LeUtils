/**
 * Handle array objects.
 * ```js
 * let arr = [4,2,7];
 * let min = $(arr).min();
 * ```
 *
 * @module ArrayMethods
 */

/**
 *
 */
export class ArrayMethods<T extends any[], G> {
  array: T;
  constructor(array: T) {
    this.array = array;
  }

  makeUnique(): T {
    let func = function(value, index, self) {
      return self.indexOf(value) === index;
    };
    return this.array.filter(func) as any;
  }

  min(): G {
    return this.array.sort((a, b) => {
      return a - b;
    })[0];
  }

  max(): G {
    return this.array.sort((a, b) => {
      return b - a;
    })[0];
  }

  minBy(prop: string): G {
    return this.array.sort((a, b) => {
      return a[prop] - b[prop];
    })[0];
  }

  maxBy(prop: string): G {
    return this.array.sort((a, b) => {
      return b[prop] - a[prop];
    })[0];
  }

  last(): G {
    return this.array[this.array.length - 1];
  }

  sum(): number {
    return this.array.reduce((acc, curr) => (acc += curr), 0);
  }

  average() {
    return this.sum() / this.array.length;
  }

  getRandom(): G {
    let index = Math.floor(Math.random() * this.array.length);
    return this.array[index];
  }

  getRandomValues(nbrOfValues: number): G[] {
    return [...Object.keys(nbrOfValues)].map(() => {
      return this.getRandom();
    });
  }

  remove(item: any) {
    let index = this.array.indexOf(item);
    if (index > -1) {
      this.array.splice(index, 1);
      return true;
    }
    return false;
  }

  shuffle() {
    let j: number, x: any, i: number;
    for (i = this.array.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = this.array[i];
      this.array[i] = this.array[j];
      this.array[j] = x;
    }
    return this.array;
  }

  divideIn(n: number) {
    let rest = this.array.length % n;
    let restUsed = rest;
    let partLength = Math.floor(this.array.length / n);
    let result: T[] = [];
    for (let i = 0; i < this.array.length; i += partLength) {
      let end = partLength + i;
      let add = false;
      if (rest !== 0 && restUsed) {
        end++;
        restUsed--;
        add = true;
      }
      result.push(this.array.slice(i, end) as any);
      if (add) {
        i++;
      }
    }
    return result;
  }

  chunks(size: number) {
    let result: T[] = [];
    for (let i = 0; i < this.array.length; i += size) {
      result.push(this.array.slice(i, i + size) as any);
    }
    return result;
  }

  flatten(): G[] {
    function flatDeep(arr) {
      return arr.reduce(
        (acc, val) => (Array.isArray(val) ? acc.concat(flatDeep(val)) : acc.concat(val)),
        []
      );
    }
    return flatDeep(this.array);
  }
}

class Helper<T extends any[]> {
  Return = handle<T>([] as any);
}
type FuncReturnType<T extends any[]> = Helper<T>['Return'];
/**
 * @ignore
 */
export type ArrayHandler<T extends any[]> = FuncReturnType<T>;

/**
 * @ignore
 */
export default function handle<T extends any[]>(array: T) {
  type G = typeof array[number];
  return new ArrayMethods<T, G>(array);
}
