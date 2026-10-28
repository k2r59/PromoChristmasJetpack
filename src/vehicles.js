export const VEHICLES = {
  sled:{name:'Traîneau blindé',texture:'rider-sled',width:180,height:138,hits:2,duration:0,speed:1,giftMultiplier:1},
  hover:{name:'Hoverboard magnétique',texture:'rider-hover',width:166,height:174,hits:1,duration:20,speed:1,giftMultiplier:1,magnet:true},
  rocket:{name:'Fusée de Noël',texture:'rider-rocket',width:180,height:143,hits:1,duration:20,speed:1.2,giftMultiplier:2},
};
export const vehicleAt=index=>['sled','hover','rocket'][index%3];
export function vehicleState(type){const spec=VEHICLES[type]||VEHICLES.sled;return{type:VEHICLES[type]?type:'sled',hits:spec.hits,remaining:spec.duration};}
export function hitVehicle(state){return state.hits>1?{...state,hits:state.hits-1}:null;}

export const VEHICLE_ORIGIN={x:.5,y:.6};
export function vehicleBottomExtent(type,angle=0){const v=VEHICLES[type],r=angle*Math.PI/180;return Math.abs(Math.sin(r))*v.width/2+Math.cos(r)*v.height*(1-VEHICLE_ORIGIN.y);}
export function vehicleFloorY(type,floor,angle=0){return floor-vehicleBottomExtent(type,angle);}
export function groundedVehiclePose(type,y,floor,angle){const clearance=floor-y-vehicleBottomExtent(type);const tilt=angle*Math.max(0,Math.min(1,clearance/24));return{y:Math.min(y,vehicleFloorY(type,floor,tilt)),angle:tilt||0};}
