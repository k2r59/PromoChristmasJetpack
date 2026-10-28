export function viewportSize(viewport,innerWidth,innerHeight){return{width:Math.max(1,Math.round(viewport?.width||innerWidth)),height:Math.max(1,Math.round(viewport?.height||innerHeight)),left:Math.round(viewport?.offsetLeft||0),top:Math.round(viewport?.offsetTop||0)};}
export function worldWidth(width,height){return Math.max(1,Math.round(width/height*720));}
export function mountViewport(element,onResize){
 let frame=0,previous='';
 const sync=()=>{frame=0;const v=viewportSize(window.visualViewport,window.innerWidth,window.innerHeight);const key=Object.values(v).join(':');if(key===previous)return;previous=key;
  Object.assign(element.style,{width:`${v.width}px`,height:`${v.height}px`,left:`${v.left}px`,top:`${v.top}px`});
  element.dataset.compact=String(v.height<=500);element.dataset.short=String(v.height<=380);element.dataset.portrait=String(v.width<v.height);
  onResize?.(v);
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(sync);};
 window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);sync();return schedule;
}
