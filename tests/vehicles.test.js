import test from 'node:test';import assert from 'node:assert/strict';
import {VEHICLES,vehicleAt,vehicleState,hitVehicle} from '../src/vehicles.js';
import {patternAt} from '../src/rules.js';
test('three vehicles rotate, with distinct bonuses',()=>{assert.deepEqual([0,1,2,3].map(vehicleAt),['sled','hover','rocket','sled']);assert.equal(VEHICLES.hover.magnet,true);assert.equal(VEHICLES.rocket.giftMultiplier,2);assert.equal(VEHICLES.rocket.duration,20);assert.equal(VEHICLES.hover.duration,20);});
test('armoured sled survives the first hit and breaks on the second',()=>{const original=vehicleState('sled'),once=hitVehicle(original);assert.equal(original.hits,2);assert.equal(once.hits,1);assert.equal(hitVehicle(once),null);assert.equal(hitVehicle(vehicleState('hover')),null);});
test('ground encounters include all three physical obstacles',()=>{const types=new Set(Array.from({length:24},(_,i)=>patternAt(i).type));for(const k of ['printer','trolley','wrapper'])assert.ok(types.has(k));});
