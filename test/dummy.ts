import { DataActor, Game_Actor, DataState } from 'mv-lib';

let dataActor: Partial<DataActor> = {
  id: 1,
  note: ''
};
let actor = new Game_Actor(null);
let states: Partial<DataState>[] = [];
actor.actor = () => dataActor as any;
actor.isActor = () => true;
actor.isEnemy = () => false;
actor.states = () => states;
actor.equips = () => [];
actor.currentClass = () => {};

export { actor, states, dataActor };
