import testModel from '../test/tags/test.urd-model';
import { tags } from '../src/Core/TagsManaging';
import { TestItem } from '../test/tags/test.urd-item';
import { $dataActors, $gameActors, Game_Actor } from 'mv-lib';

//@ts-ignore
let actor = $gameActors.actor(1) as Game_Actor;

let tag = tags<TestItem>(actor, testModel);

let getter = tag.get();
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

test('getting a map', async () => {
  let map = await getter.my_tag().obj();
  expect(map).toEqual({
    a: 100,
    b: 5
  });
});

test('watching changes', async () => {
  watcher.my_tag().nbr({ a: 100 }, (tagResult: any, beforeValue: any, afterValue: any) => {
    expect(afterValue).toBe(3495);
    return false;
  });
  tag.checkWatchers();
});
