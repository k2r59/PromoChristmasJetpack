import test from 'node:test';import assert from 'node:assert/strict';import {coursePattern,beamEnds,touchesBeam} from '../src/course.js';
test('seeded courses are repeatable, varied and leave recovery sections',()=>{const a=Array.from({length:100},(_,i)=>coursePattern(i,17));assert.deepEqual(a,Array.from({length:100},(_,i)=>coursePattern(i,17)));assert.notDeepEqual(a,Array.from({length:100},(_,i)=>coursePattern(i,18)));assert.ok(a.some(x=>x.type==='laser'));assert.ok(a.some(x=>x.rotating));for(let i=0;i<100;i++){assert.ok(a[i].gap>=680);assert.ok(a[i].safeY>=150&&a[i].safeY<=550);if(i%7===6)assert.equal(a[i].type,'rest');}});
test('electric collision follows beam angle, not an invisible bounding rectangle',()=>{const b=beamEnds(300,300,45);assert.equal(touchesBeam({x:300,y:300,radius:20},b),true);assert.equal(touchesBeam({x:360,y:360,radius:20},b),false);});

import {missileSalvo} from '../src/course.js';
test('missile salvos ramp from singles to doubles and triples with readable warnings',()=>{
 assert.equal(missileSalvo(20,.1).count,1);assert.equal(missileSalvo(50,.1).count,2);assert.equal(missileSalvo(100,.1).count,3);
 for(let t=0;t<1000;t+=10){const s=missileSalvo(t,.5);assert.ok(s.count<=3);assert.ok(s.warning>=1.4);assert.ok(s.interval>=6);}
});
