import test from 'node:test';import assert from 'node:assert/strict';
import {integrateFlight,intersects,patternAt,speedAt,scoreFor,FLOOR,CEILING}from '../src/rules.js';
test('touch ascends, release descends, bounded flight',()=>{let a={y:350,velocity:0};for(let i=0;i<120;i++)a=integrateFlight(a.y,a.velocity,true,1/60);assert.equal(a.y,CEILING);for(let i=0;i<240;i++)a=integrateFlight(a.y,a.velocity,false,1/60);assert.equal(a.y,FLOOR-28);});
test('collision accounts for corners and forgiving player radius',()=>{const box={x:100,y:100,w:50,h:50};assert.equal(intersects({x:80,y:80,radius:21},box),false);assert.equal(intersects({x:90,y:125,radius:21},box),true);});
test('difficulty is bounded and sequences offer traversable lanes',()=>{assert.equal(speedAt(0),230);assert.equal(speedAt(9999),560);for(let i=0;i<100;i++){const p=patternAt(i);assert.ok(p.gap>=620);assert.ok(p.safeY>CEILING+50&&p.safeY<FLOOR-50);}});
test('gifts and chain bonuses contribute to score',()=>assert.equal(scoreFor(100.8,5,1),550));

test('endless course accelerates smoothly over short and long runs',()=>{let previous=230;for(let seconds=1;seconds<=600;seconds++){const speed=speedAt(seconds);assert.ok(speed>previous);assert.ok(speed-previous<3.1);assert.ok(speed<560);previous=speed;}});
