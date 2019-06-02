import testModel from './test.urd-model';
import { tags } from '../../src/Core/TagsManaging';
import { TestItem } from './test.urd-item';
import { actor, states, dataActor } from '../dummy';

/*
let tags = tags(...);
tags.my_tag.get() || tags.my_tag.collect() || tags.my_tag.watch() || tags.my_tag.unwatch()
tags.my_tag.next().nbr.get()
*/

/*
let tags = tags(...);
tags.get('my_tag.nbr', [ {}, {}])
tags.collect('my_tag.nbr', [ {}, {}])
let obs = tags.observable('my_tag.nbr');
obs.onGetContext((path) => context);
obs.onChange((tagRes, before, after) => {});
obs.dispose();

let obsBulk = tags.observeAny([obs], (tagRes, before, after) => {});
obsBulk.dispose();
*/

dataActor.note = `
  <my_tag>
  <!nbr>
  return 500 + context.a;
  </nbr>
  nbr+: 65
  nbr%: 200
  str: hello
  str+: world
  list+: 10
  obj(b): 20
  obj(a)+: 100
  </my_tag>
  `;

states.push({
  id: 1,
  note: `
    <my_tag>
    str+: world
    obj(b): 5
    </my_tag>
    `
});

let tag = tags<TestItem>(actor, testModel);

let getter = tag.getter();
let collector = tag.collect();
let watcher = tag.watch();

test('getting a number', async () => {
  let nbr = await getter.my_tag().nbr({ context: { a: 100 } });
  expect(nbr).toBe(1995);
});

test('getting a string', async () => {
  let str = await getter.my_tag().str();
  expect(str).toBe('hello,world,world');
});

test('getting a list (without base value)', async () => {
  let list = await getter.my_tag().list();
  expect(list).toBe('10');
});

test('getting a number (overshadowed base value)', async () => {
  states.push({
    id: 2,
    note: `
      <my_tag>
      nbr: 10
      </my_tag>
      `
  });
  let nbr = await getter.my_tag().nbr({ context: { a: 100 } });
  expect(nbr).toBe(225);
  states.pop();
});

test('getting a map', async () => {
  let map = await getter.my_tag().obj();
  expect(map).toEqual({
    a: 100,
    b: 5
  });
});

test('collecting numbers', async () => {
  states.push({
    id: 2,
    note: `
      <my_tag>
      nbr: 10
      </my_tag>
      `
  });
  let nbrs = await collector.my_tag().nbr({ context: { a: 100 } });
  expect(nbrs).toEqual([10, 600]);
  states.pop();
});

test('watching changes', async () => {
  watcher.my_tag().nbr({ a: 100 }, (tagResult: any, beforeValue: any, afterValue: any) => {
    expect(afterValue).toBe(3495);
    return false;
  });

  states.push({
    id: 2,
    note: `
        <my_tag>
        nbr+: 500
        </my_tag>
        `
  });
  tag.checkWatchers();
});
