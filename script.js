(function(){
var FLY="flyer.jpg";
var R={x:437,y:826,w:824,h:901};            // white picture rectangle
var P={x:523,y:1561,w:660,h:119};           // name pill
var cv=document.getElementById('c'),ctx=cv.getContext('2d');
var $=function(i){return document.getElementById(i)};
var fly=new Image(),pic=null,s={z:1,x:0,y:0};
var nameEl=$('name'),zoom=$('zoom'),px=$('px'),py=$('py');

function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.drawImage(fly,0,0,cv.width,cv.height);
  // white rectangle for the picture
  ctx.fillStyle='#fff';ctx.fillRect(R.x,R.y,R.w,R.h);
  if(pic){
    ctx.save();ctx.beginPath();ctx.rect(R.x,R.y,R.w,R.h);ctx.clip();
    var base=Math.max(R.w/pic.width,R.h/pic.height),sc=base*s.z;
    var dw=pic.width*sc,dh=pic.height*sc;
    var mx=Math.max(0,(dw-R.w)/2),my=Math.max(0,(dh-R.h)/2);
    var ox=R.x+(R.w-dw)/2+s.x/100*mx*-1, oy=R.y+(R.h-dh)/2+s.y/100*my*-1;
    ctx.drawImage(pic,ox,oy,dw,dh);ctx.restore();
  }
  // name pill
  ctx.save();ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=18;ctx.shadowOffsetY=8;
  var g=ctx.createLinearGradient(0,P.y,0,P.y+P.h);
  g.addColorStop(0,'#f6625c');g.addColorStop(.5,'#d93a32');g.addColorStop(1,'#a70d03');
  ctx.fillStyle=g;rr(P.x,P.y,P.w,P.h,P.h/2);ctx.fill();ctx.restore();
  var t=nameEl.value.trim();
  if(t){
    var fs=78;ctx.font='700 '+fs+'px "Segoe UI",Roboto,Helvetica,Arial,sans-serif';
    while(ctx.measureText(t).width>P.w-90&&fs>24){fs-=2;ctx.font='700 '+fs+'px "Segoe UI",Roboto,Helvetica,Arial,sans-serif'}
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(t,P.x+P.w/2,P.y+P.h/2+3);
  }
  $('dl').disabled=!(pic&&t);
}

function sync(){
  s.z=zoom.value/100;s.x=+px.value;s.y=+py.value;
  $('zv').textContent=zoom.value+'%';$('xv').textContent=px.value;$('yv').textContent=py.value;
  draw();
}
[zoom,px,py].forEach(function(e){e.addEventListener('input',sync)});
nameEl.addEventListener('input',draw);
$('reset').onclick=function(){zoom.value=100;px.value=0;py.value=0;sync()};

$('photo').addEventListener('change',function(e){
  var f=e.target.files[0];if(!f)return;
  var u=URL.createObjectURL(f),im=new Image();
  im.onload=function(){pic=im;$('reset').click()};
  im.src=u;
});

// drag the picture on the flyer
var drag=null;
function pt(e){var b=cv.getBoundingClientRect();return{x:(e.clientX-b.left)*cv.width/b.width,y:(e.clientY-b.top)*cv.height/b.height}}
cv.addEventListener('pointerdown',function(e){
  if(!pic)return;var p=pt(e);
  if(p.x<R.x||p.x>R.x+R.w||p.y<R.y||p.y>R.y+R.h)return;
  drag={p:p,x:s.x,y:s.y};cv.setPointerCapture(e.pointerId);cv.classList.add('drag');
});
cv.addEventListener('pointermove',function(e){
  if(!drag)return;var p=pt(e);
  var base=Math.max(R.w/pic.width,R.h/pic.height)*s.z;
  var mx=Math.max(1,(pic.width*base-R.w)/2),my=Math.max(1,(pic.height*base-R.h)/2);
  var nx=drag.x-(p.x-drag.p.x)/mx*100,ny=drag.y-(p.y-drag.p.y)/my*100;
  px.value=Math.max(-100,Math.min(100,Math.round(nx)));py.value=Math.max(-100,Math.min(100,Math.round(ny)));sync();
});
function end(){drag=null;cv.classList.remove('drag')}
cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);

// download
$('dl').onclick=function(){
  var m=$('msg');m.textContent='';
  try{
    cv.toBlob(function(blob){
      if(!blob){m.style.color='var(--red)';m.textContent='The flyer could not be saved. Host the site or use a local server, then try again.';return}
      var fn='I-will-be-there-'+nameEl.value.trim().replace(/[^\w]+/g,'-').replace(/^-|-$/g,'')+'.png';
      var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fn;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
      m.style.color='var(--green)';m.textContent='Your flyer is downloading.';
    },'image/png');
  }catch(err){
    m.style.color='var(--red)';m.textContent='The flyer could not be saved. Host the site or use a local server, then try again.';
  }
};

fly.onload=draw;fly.src=FLY;
})();
