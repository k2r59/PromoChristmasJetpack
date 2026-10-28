// Dimensions preserve each source aspect ratio and normalize the seated elf head to ~32 world pixels.
export const VEHICLES = {
  sled:{name:'Traîneau blindé',texture:'rider-sled',width:116.28,height:89.148,hits:2,duration:0,speed:1,giftMultiplier:1},
  hover:{name:'Hoverboard magnétique',texture:'rider-hover',width:88.92,height:93.0696,hits:1,duration:20,speed:1,giftMultiplier:1,magnet:true},
  rocket:{name:'Fusée de Noël',texture:'rider-rocket',width:112.48,height:89.2316,hits:1,duration:20,speed:1.2,giftMultiplier:2},
};
export const vehicleAt=index=>['sled','hover','rocket'][index%3];
export function vehicleState(type){const spec=VEHICLES[type]||VEHICLES.sled;return{type:VEHICLES[type]?type:'sled',hits:spec.hits,remaining:spec.duration};}
export function hitVehicle(state){return state.hits>1?{...state,hits:state.hits-1}:null;}

export const VEHICLE_ORIGIN={x:.5,y:.6};
export function vehicleBottomExtent(type,angle=0){const v=VEHICLES[type],r=angle*Math.PI/180;return Math.abs(Math.sin(r))*v.width/2+Math.cos(r)*v.height*(1-VEHICLE_ORIGIN.y);}
export function vehicleFloorY(type,floor,angle=0){return floor-vehicleBottomExtent(type,angle);}
export function groundedVehiclePose(type,y,floor,angle){const clearance=floor-y-vehicleBottomExtent(type);const tilt=angle*Math.max(0,Math.min(1,clearance/24));return{y:Math.min(y,vehicleFloorY(type,floor,tilt)),angle:tilt||0};}

// Separate input response for each ride; all share the same ground/contact geometry.
export function integrateVehicle(type,y,velocity,held,wasHeld,dt,floor=631){
 const bottom=vehicleFloorY(type,floor),top=100+VEHICLES[type].height*.6;
 let v=velocity;
 if(type==='sled'){
  if(held&&!wasHeld&&y>=bottom-2)v=-620;
  v=Math.min(550,v+950*dt);
 }else if(type==='hover')v+=( (held?-300:240)-v)*(1-Math.exp(-12*dt));
 else v=Math.max(-390,Math.min(430,v+(held?-520:430)*dt));
 const next=Math.max(top,Math.min(bottom,y+v*dt));
 return{y:next,velocity:next===top||next===bottom?0:v};
}
