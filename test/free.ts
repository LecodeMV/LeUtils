import testModel from './tags/test.urd-model';
import { tags } from '../src/Core/TagsManaging';
import { TestItem, TestItemProps } from './tags/test.urd-item';
import { actor, states, dataActor } from './dummy';


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
    nbr: 10
    str+: world
    obj(b): 5
    </my_tag>
    `
});

let tag = tags<TestItem, TestItemProps>(actor, testModel);

let getter = tag.getter();
let collector = tag.collector();
//let watcher = tag.watch();
let observable = tag.observable('my_tag.nbr', 0);
observable.onGetContext((prop: string) => {
  switch (prop) {
    case 'my_tag': return {};
    case 'nbr': return { a: 100};
  }
});
observable.onChange((tag, beforeValue, afterValue) => {

});
observable.dispose();

let anyObservable = tag.observeAny([observable], (tag) => {

});
anyObservable.dispose();

tag.observeAnyFrom('my_tag', tag => {

});

(async () => {

    let nbr = await getter.my_tag().nbr({ context: { a: 0} });
    console.log('nbr :', nbr);

    let nbr2 = await tag.get('my_tag.nbr',{}, { a: 0});
    console.log('nbr2 :', nbr2);

    let allNbrs = await collector.my_tag().nbr({ context: { a: 0}});
    console.log('allNbrs :', allNbrs);

    let allNbrs2 = await tag.collect('my_tag.nbr', {}, { a: 0});
    console.log('allNbrs2 :', allNbrs2);
})();


