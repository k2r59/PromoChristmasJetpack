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

import {integrateVehicle} from '../src/vehicles.js';
test('sled jumps only on a fresh grounded press and cannot fly by holding',()=>{
 const floor=vehicleFloorY('sled',631);let p=integrateVehicle('sled',floor,0,true,false,1/60);assert.ok(p.velocity<0);
 for(let i=0;i<240;i++)p=integrateVehicle('sled',p.y,p.velocity,true,true,1/60);
 assert.equal(p.y,floor);assert.equal(p.velocity,0);
 assert.equal(integrateVehicle('sled',floor-60,0,true,false,1/60).velocity>0,true);
});
test('hover reacts faster than inertial rocket and every ride stays in bounds',()=>{
 assert.ok(integrateVehicle('hover',350,0,true,false,.033).velocity<integrateVehicle('rocket',350,0,true,false,.033).velocity);
 for(const type of Object.keys(VEHICLES))for(const held of [true,false]){let p={y:350,velocity:0};for(let i=0;i<600;i++){p=integrateVehicle(type,p.y,p.velocity,held,held,1/60);assert.ok(p.y<=vehicleFloorY(type,631));assert.ok(p.y>=100);}}
});
import {intersects} from '../src/rules.js';
test('sled can clear each scaled ground obstacle at early and late course speeds',()=>{
 for(const speed of [230,300,400,560])for(const [width,height] of [[170,205],[145,215],[195,165]]){
  let possible=false;
  for(let lead=50;lead<550&&!possible;lead+=2){
   let p={y:vehicleFloorY('sled',631),velocity:0},x=lead,hit=false;
   for(let frame=0;x>-200;frame++){
    p=integrateVehicle('sled',p.y,p.velocity,frame===0,false,1/120);x-=speed/120;
    if(intersects({x:14,y:p.y+3,radius:30},{x:x-width*.65*.36,y:631-height*.65*.86,w:width*.65*.72,h:height*.65*.86})){hit=true;break;}
   }
   possible=!hit;
  }
  assert.ok(possible,`No viable jump for ${width}x${height} at ${speed}`);
 }
});
