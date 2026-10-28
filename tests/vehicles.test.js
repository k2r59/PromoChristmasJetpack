import test from 'node:test';import assert from 'node:assert/strict';
import {VEHICLES,vehicleAt,vehicleState,hitVehicle} from '../src/vehicles.js';
import {coursePattern} from '../src/course.js';
test('three vehicles rotate, with distinct bonuses',()=>{assert.deepEqual([0,1,2,3].map(vehicleAt),['sled','hover','rocket','sled']);assert.equal(VEHICLES.hover.magnet,true);assert.equal(VEHICLES.rocket.giftMultiplier,2);assert.equal(VEHICLES.rocket.duration,20);assert.equal(VEHICLES.hover.duration,20);});
test('armoured sled survives the first hit and breaks on the second',()=>{const original=vehicleState('sled'),once=hitVehicle(original);assert.equal(original.hits,2);assert.equal(once.hits,1);assert.equal(hitVehicle(once),null);assert.equal(hitVehicle(vehicleState('hover')),null);});
test('ground encounters include all three physical obstacles',()=>{const types=new Set(Array.from({length:24},(_,i)=>coursePattern(i,99).type));for(const k of ['printer','trolley','wrapper'])assert.ok(types.has(k));});
import {vehicleFloorY} from '../src/vehicles.js';
test('all vehicle sprites stop with their bottom exactly on the floor',()=>{for(const [type,v]of Object.entries(VEHICLES))assert.equal(vehicleFloorY(type,631)+v.height*.4,631);});

import {groundedVehiclePose,vehicleBottomExtent} from '../src/vehicles.js';
test('rotated vehicles never cross the floor on approach, landing or vehicle switch',()=>{for(const type of Object.keys(VEHICLES))for(let y=500;y<=650;y+=2)for(const angle of [-20,-5,0,5,20]){const p=groundedVehiclePose(type,y,631,angle);assert.ok(p.y+vehicleBottomExtent(type,p.angle)<=631.000001);if(y>=vehicleFloorY(type,631))assert.equal(p.angle,0);}});
