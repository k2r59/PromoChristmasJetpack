export const VEHICLES = {
  sled:{name:'Traîneau blindé',texture:'sled',width:165,height:88,hits:2,duration:0,speed:1,giftMultiplier:1},
  hover:{name:'Hoverboard magnétique',texture:'hover',width:155,height:68,hits:1,duration:20,speed:1,giftMultiplier:1,magnet:true},
  rocket:{name:'Fusée de Noël',texture:'rocket',width:180,height:80,hits:1,duration:20,speed:1.2,giftMultiplier:2},
};
export const vehicleAt=index=>['sled','hover','rocket'][index%3];
export function vehicleState(type){const spec=VEHICLES[type]||VEHICLES.sled;return{type:VEHICLES[type]?type:'sled',hits:spec.hits,remaining:spec.duration};}
export function hitVehicle(state){return state.hits>1?{...state,hits:state.hits-1}:null;}
