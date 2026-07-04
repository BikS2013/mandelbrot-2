(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=-2.1,t=2.1,n=t-e,r=.55,i=.22,a=Math.tan(28*Math.PI/180),o=1e-12,s=4.2,c={cx:-.6,cy:0,w:4.2},l={yaw:-.682,pitch:.313,dist:3.577,tx:-.3,ty:.4,tz:.3};function u(e){return Math.max(400,Math.min(2500,Math.round(400+300*Math.log10(4.2/e))))}function d(e,t,n){return Math.min(Math.max(e,t),n)}var f={sphere:!0,shadows:!0,crt:!0,az:45,el:21,sunI:1.05,beta:4.8,grid:1024,sphX:-1.15,sphY:.08,sphAlt:0},p={...l},m={...c},h=[];function g(e,t){return[m.cx+e*(m.w/n),m.cy+t*(m.w/n)]}var _=!0;function v(){_=!0}function y(){let e=_;return _=!1,e}function b(e){let t=Math.cos(p.pitch),n=Math.sin(p.pitch),r=Math.cos(p.yaw),i=Math.sin(p.yaw),a=p.tx+p.dist*t*r,o=p.ty+p.dist*t*i,s=p.tz+p.dist*n;e.data&&(s=Math.max(s,e.height(a,o)+.04));let c=[p.tx-a,p.ty-o,p.tz-s],l=Math.hypot(c[0],c[1],c[2]);c[0]/=l,c[1]/=l,c[2]/=l;let u=[c[1],-c[0],0],d=Math.hypot(u[0],u[1])||1;u[0]/=d,u[1]/=d;let f=[u[1]*c[2],-u[0]*c[2],u[0]*c[1]-u[1]*c[0]];return{pos:[a,o,s],fwd:c,right:u,up:f}}function x(e,t,n,r){let i=t.getBoundingClientRect(),o=((n-i.left)/i.width*2-1)*(i.width/i.height),s=-((r-i.top)/i.height*2-1),c=b(e),l=[c.fwd[0]+a*(o*c.right[0]+s*c.up[0]),c.fwd[1]+a*(o*c.right[1]+s*c.up[1]),c.fwd[2]+a*(o*c.right[2]+s*c.up[2])],u=Math.hypot(l[0],l[1],l[2]);l[0]/=u,l[1]/=u,l[2]/=u;let d=.02,f=.02,p=-1;for(let t=0;t<900;t++){let t=c.pos[0]+l[0]*d,n=c.pos[1]+l[1]*d;if(c.pos[2]+l[2]*d<e.height(t,n)){p=d;break}if(d>12)break;f=d,d+=.004*(1+d)}if(p<0)return null;let m=f,h=p;for(let t=0;t<10;t++){let t=.5*(m+h);c.pos[2]+l[2]*t<e.height(c.pos[0]+l[0]*t,c.pos[1]+l[1]*t)?h=t:m=t}let g=.5*(m+h);return[c.pos[0]+l[0]*g,c.pos[1]+l[1]*g]}function S(n,r,i){let a=new Map,o=!1,s={t:0,x:0,y:0},c=0;function l(e,t){let n=performance.now();n-c<500||(c=n,i.onDive(e,t))}function u(n,i){let a=b(r),o=p.dist*.0011,s=[a.fwd[0],a.fwd[1]],c=Math.hypot(s[0],s[1])||1;s[0]/=c,s[1]/=c,p.tx+=-a.right[0]*n*o+s[0]*i*o,p.ty+=-a.right[1]*n*o+s[1]*i*o,p.tx=d(p.tx,e,t),p.ty=d(p.ty,e,t)}n.addEventListener(`contextmenu`,e=>e.preventDefault()),n.addEventListener(`pointerdown`,e=>{try{n.setPointerCapture(e.pointerId)}catch{}a.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:!1}),a.size>1&&a.forEach(e=>{e.moved=!0}),o=e.button===2||e.shiftKey,n.classList.add(`dragging`)}),n.addEventListener(`pointerup`,e=>{let t=a.get(e.pointerId);if(a.delete(e.pointerId),a.size===0&&n.classList.remove(`dragging`),e.pointerType===`touch`&&t&&!t.moved){let t=performance.now();t-s.t<350&&Math.hypot(e.clientX-s.x,e.clientY-s.y)<25?(s.t=0,l(e.clientX,e.clientY)):s={t,x:e.clientX,y:e.clientY}}}),n.addEventListener(`pointercancel`,e=>{a.delete(e.pointerId)}),n.addEventListener(`pointermove`,e=>{let t=a.get(e.pointerId);if(!t)return;let n=e.clientX-t.x,r=e.clientY-t.y,s=t.moved||Math.hypot(e.clientX-t.sx,e.clientY-t.sy)>10;if(a.size===2){let n=[...a.keys()],r=a.get(n[0]===e.pointerId?n[1]:n[0]);if(a.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:t.sx,sy:t.sy,moved:!0}),!r)return;let o=Math.hypot(t.x-r.x,t.y-r.y),s=Math.hypot(e.clientX-r.x,e.clientY-r.y);o>0&&s>0&&(p.dist=d(p.dist*o/s,.35,9)),u((e.clientX-t.x)/2,(e.clientY-t.y)/2),i.markDirty();return}a.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:t.sx,sy:t.sy,moved:s}),o?u(n,r):(p.yaw-=n*.005,p.pitch=d(p.pitch+r*.005,.05,1.45)),i.markDirty()}),n.addEventListener(`wheel`,e=>{e.preventDefault(),p.dist=d(p.dist*Math.exp(e.deltaY*.0012),.35,9),i.markDirty()},{passive:!1}),n.addEventListener(`dblclick`,e=>l(e.clientX,e.clientY))}var C=window.matchMedia(`(pointer: coarse)`).matches||navigator.maxTouchPoints>0||/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),w=window.matchMedia(`(max-width: 640px)`).matches,T=class{data=null;n=0;computing=!1;worker=new Worker(new URL(``+new URL(`field.worker-DlXLb6BI.js`,import.meta.url).href,``+import.meta.url),{type:`module`});compute(e,t,n){return this.computing?Promise.reject(Error(`field computation already running`)):(this.computing=!0,new Promise(r=>{this.worker.onmessage=e=>{let t=e.data;t.type===`progress`?n(t.done):(this.data=t.data,this.n=t.n,this.computing=!1,r())};let i={n:e,cx:t.cx,cy:t.cy,w:t.w,maxiter:u(t.w)};this.worker.postMessage(i)}))}gAt(n,r){let i=this.data;if(!i)return 0;let a=this.n,o=(n-e)/(t-e)*(a-1),s=(r-e)/(t-e)*(a-1);o=Math.min(Math.max(o,0),a-1.001),s=Math.min(Math.max(s,0),a-1.001);let c=o|0,l=s|0,u=o-c,d=s-l,f=(e,t)=>i[(e*a+t)*2];return(f(l,c)*(1-u)+f(l,c+1)*u)*(1-d)+(f(l+1,c)*(1-u)+f(l+1,c+1)*u)*d}height(e,t){return r*Math.exp(-f.beta*this.gAt(e,t))}sphereZ(){return this.height(f.sphX,f.sphY)+i*.75+f.sphAlt}},E=[[0,238,236,242],[.35,255,140,40],[.8,120,25,8],[1.4,15,6,8]];function ee(e){if(e<=0)return[E[0][1],E[0][2],E[0][3]];for(let t=1;t<E.length;t++)if(e<=E[t][0]){let n=(e-E[t-1][0])/(E[t][0]-E[t-1][0]);return[E[t-1][1]+(E[t][1]-E[t-1][1])*n,E[t-1][2]+(E[t][2]-E[t-1][2])*n,E[t-1][3]+(E[t][3]-E[t-1][3])*n]}return[15,6,8]}function te(e,t){let n=t.data;if(!n)return;let r=e.width,i=t.n,a=e.getContext(`2d`);if(!a)return;let o=a.createImageData(r,r);for(let e=0;e<r;e++){let t=Math.round((1-(e+.5)/r)*(i-1));for(let a=0;a<r;a++){let s=Math.round((a+.5)/r*(i-1)),c=(t*i+s)*2,l=(e*r+a)*4,u=n[c+1]>.5?[5,5,8]:ee(n[c]);o.data[l]=u[0],o.data[l+1]=u[1],o.data[l+2]=u[2],o.data[l+3]=255}}a.putImageData(o,0,0)}var ne=`#version 300 es
void main(){
  vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position=vec4(p*2.0-1.0, 0.0, 1.0);
}`,D=`#version 300 es
precision highp float;
precision highp int;
uniform highp sampler2D uField;
uniform vec2 uRes;
uniform vec3 uCamPos, uFwd, uRight, uUp;
uniform float uTanHalf;
uniform vec3 uSunDir;
uniform float uSunI, uBeta;
uniform vec4 uSphere;
uniform bool uSphereOn, uShadows, uCrt;
out vec4 fragColor;

const vec2 GMIN=vec2(${e.toFixed(2)}, ${e.toFixed(2)});
const vec2 GSIZE=vec2(${n.toFixed(2)}, ${n.toFixed(2)});
const float H=${r};
const vec3 AMB=vec3(0.22,0.20,0.30);
const vec3 SUNC=vec3(1.0,0.95,0.90);
const vec3 HORIZON=vec3(1.0,0.42,0.05);
const vec3 SPHCOL=vec3(0.46,0.47,0.78);
const float TMAX=12.0;

vec2 fieldAt(vec2 p){                 // manual bilinear: R=normalized sqrt(phi), G=interior
  vec2 ts=vec2(textureSize(uField,0));
  vec2 f=(p-GMIN)/GSIZE*ts-0.5;
  vec2 fl=floor(f), fr=f-fl;
  ivec2 i0=clamp(ivec2(fl), ivec2(0), ivec2(ts)-ivec2(2));
  vec2 a=texelFetch(uField,i0,0).rg;
  vec2 b=texelFetch(uField,i0+ivec2(1,0),0).rg;
  vec2 c=texelFetch(uField,i0+ivec2(0,1),0).rg;
  vec2 d=texelFetch(uField,i0+ivec2(1,1),0).rg;
  return mix(mix(a,b,fr.x), mix(c,d,fr.x), fr.y);
}
float hAt(vec2 p){ return H*exp(-uBeta*fieldAt(p).x); }

float marchTerrain(vec3 ro, vec3 rd){
  float t=0.02, tPrev=0.02; bool hit=false;
  for(int i=0;i<800;i++){
    vec3 p=ro+rd*t;
    if(p.z<hAt(p.xy)){ hit=true; break; }
    if(t>TMAX) break;
    tPrev=t; t+=0.004*(1.0+t);
  }
  if(!hit) return -1.0;
  float lo=tPrev, hi=t;
  for(int i=0;i<10;i++){
    float mid=0.5*(lo+hi);
    if(ro.z+rd.z*mid < hAt(ro.xy+rd.xy*mid)) hi=mid; else lo=mid;
  }
  return 0.5*(lo+hi);
}

float shadowAt(vec3 p){
  float t=0.02;
  for(int i=0;i<200;i++){
    vec3 q=p+uSunDir*t;
    if(q.z>H*1.05) return 1.0;
    if(q.z<hAt(q.xy)) return 0.0;
    t+=0.010*(1.0+t);
  }
  return 1.0;
}

vec3 skyColor(vec3 rd){
  float k=clamp((rd.z+0.02)/0.24, 0.0, 1.0)*3.0;
  vec3 s1=vec3(0.55,0.10,0.02), s2=vec3(0.10,0.02,0.02), s3=vec3(0.01,0.01,0.015);
  if(k<1.0) return mix(HORIZON,s1,k);
  if(k<2.0) return mix(s1,s2,k-1.0);
  return mix(s2,s3,k-2.0);
}

void main(){
  vec2 sc=(gl_FragCoord.xy/uRes)*2.0-1.0;
  sc.x*=uRes.x/uRes.y;
  vec3 rd=normalize(uFwd + uTanHalf*(sc.x*uRight + sc.y*uUp));
  vec3 ro=uCamPos;

  float tT=marchTerrain(ro,rd);
  float tS=-1.0;
  if(uSphereOn){
    vec3 oc=ro-uSphere.xyz;
    float b=dot(rd,oc);
    float disc=b*b-(dot(oc,oc)-uSphere.w*uSphere.w);
    if(disc>0.0){ float tt=-b-sqrt(disc); if(tt>0.0) tS=tt; }
  }

  vec3 col;
  bool sphereFirst=(tS>0.0)&&(tT<0.0||tS<tT);
  if(sphereFirst){
    vec3 p=ro+rd*tS;
    vec3 n=normalize(p-uSphere.xyz);
    float dif=max(dot(n,uSunDir),0.0);
    float rim=pow(clamp(1.0+dot(n,rd),0.0,1.0),2.0);
    col=SPHCOL*(AMB*1.1+SUNC*(uSunI*0.9*dif))+vec3(rim*0.08);
    col=mix(col,HORIZON,1.0-exp(-0.008*tS*tS*tS));
  } else if(tT>0.0){
    vec3 p=ro+rd*tT;
    vec2 fv=fieldAt(p.xy);
    if(fv.y>0.5){
      col=vec3(0.015,0.012,0.02);            // the set itself: black lake
    } else {
      vec2 ts=vec2(textureSize(uField,0));
      float e=GSIZE.x/ts.x;
      float hx=hAt(p.xy+vec2(e,0.0))-hAt(p.xy-vec2(e,0.0));
      float hy=hAt(p.xy+vec2(0.0,e))-hAt(p.xy-vec2(0.0,e));
      vec3 n=normalize(vec3(-hx/(2.0*e), -hy/(2.0*e), 1.0));
      float dif=max(dot(n,uSunDir),0.0);
      float sh=1.0;
      if(uShadows&&dif>0.001) sh=shadowAt(p+n*0.004+uSunDir*0.01);
      col=vec3(0.93,0.93,0.96)*(AMB+SUNC*(uSunI*dif*sh));
    }
    col=mix(col,HORIZON,1.0-exp(-0.008*tT*tT*tT));  // fog == horizon color
  } else {
    col=skyColor(rd);
  }

  col=pow(clamp(col,0.0,1.0), vec3(1.0/1.6));
  if(uCrt&&(int(gl_FragCoord.y)%3==0)) col*=0.94;
  fragColor=vec4(col,1.0);
}`,O=C?1:1.5,k=[`uField`,`uRes`,`uCamPos`,`uFwd`,`uRight`,`uUp`,`uTanHalf`,`uSunDir`,`uSunI`,`uBeta`,`uSphere`,`uSphereOn`,`uShadows`,`uCrt`],re=class{canvas;gl;u;fieldTex=null;constructor(e){this.canvas=e;let t=e.getContext(`webgl2`,{antialias:!1,alpha:!1});if(!t)throw Error(`WebGL2 is required`);this.gl=t;let n=t.createProgram();if(t.attachShader(n,this.compile(t.VERTEX_SHADER,ne)),t.attachShader(n,this.compile(t.FRAGMENT_SHADER,D)),t.linkProgram(n),!t.getProgramParameter(n,t.LINK_STATUS))throw Error(t.getProgramInfoLog(n)??`shader link failed`);t.useProgram(n),this.u=Object.fromEntries(k.map(e=>[e,t.getUniformLocation(n,e)]))}compile(e,t){let n=this.gl,r=n.createShader(e);if(!r)throw Error(`createShader failed`);if(n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS))throw Error(n.getShaderInfoLog(r)??`shader compile failed`);return r}uploadField(e,t){let n=this.gl;this.fieldTex||=n.createTexture(),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,this.fieldTex),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.pixelStorei(n.UNPACK_ALIGNMENT,1),n.texImage2D(n.TEXTURE_2D,0,n.RG32F,t,t,0,n.RG,n.FLOAT,e)}draw(e){let t=this.gl,n=Math.min(window.devicePixelRatio||1,O),r=Math.round(this.canvas.clientWidth*n),o=Math.round(this.canvas.clientHeight*n);(this.canvas.width!==r||this.canvas.height!==o)&&(this.canvas.width=r,this.canvas.height=o),t.viewport(0,0,r,o);let{basis:s}=e;t.uniform1i(this.u.uField,0),t.uniform2f(this.u.uRes,r,o),t.uniform3fv(this.u.uCamPos,s.pos),t.uniform3fv(this.u.uFwd,s.fwd),t.uniform3fv(this.u.uRight,s.right),t.uniform3fv(this.u.uUp,s.up),t.uniform1f(this.u.uTanHalf,a),t.uniform3fv(this.u.uSunDir,e.sunDir),t.uniform1f(this.u.uSunI,e.sunI),t.uniform1f(this.u.uBeta,e.beta),t.uniform4f(this.u.uSphere,e.sphereX,e.sphereY,e.sphereZ,i),t.uniform1i(this.u.uSphereOn,+!!e.sphereOn),t.uniform1i(this.u.uShadows,+!!e.shadows),t.uniform1i(this.u.uCrt,+!!e.crt),t.drawArrays(t.TRIANGLES,0,3)}};function A(e){let t=document.getElementById(e);if(!t)throw Error(`missing element #${e}`);return t}var j=A(`overlay`),M=j.querySelector(`b`),N=A(`prog`),P=A(`pct`);function ie(e){M.textContent=e,N.value=0,P.textContent=`0%`,j.classList.remove(`hidden`)}function F(e){N.value=e,P.textContent=`${Math.round(100*e)}%`}function I(){j.classList.add(`hidden`)}function L(e){j.classList.remove(`hidden`),j.querySelector(`.card`).innerHTML=e}var R=A(`roRe`),z=A(`roIm`),B=A(`roW`),V=A(`roZ`),H=A(`zin`),U=A(`zout`),W=A(`zback`),G=A(`zreset`),K=A(`minimap`);function q(e){let t=Math.max(5,Math.min(15,Math.ceil(-Math.log10(m.w))+4));return e.toFixed(t)}function J(){R.textContent=q(m.cx),z.textContent=q(m.cy),B.textContent=m.w>=.01?m.w.toFixed(4):m.w.toExponential(2);let e=4.2/m.w;V.textContent=`×${e<1e3?String(Math.round(e*10)/10):e.toExponential(1)}`,W.disabled=h.length===0,U.disabled=m.w>=s,H.disabled=m.w<=o}function ae(e){let{field:t}=e;function n(n,r,i){t.computing||(h.push({...m}),m.cx=n,m.cy=r,m.w=d(i,o,s),e.recompute())}H.addEventListener(`click`,()=>n(m.cx,m.cy,m.w/2)),U.addEventListener(`click`,()=>n(m.cx,m.cy,m.w*2)),W.addEventListener(`click`,()=>{if(t.computing)return;let n=h.pop();n&&(Object.assign(m,n),e.recompute())}),G.addEventListener(`click`,()=>{t.computing||(h.length=0,Object.assign(m,c),e.recompute())}),K.addEventListener(`click`,e=>{if(t.computing||!t.data)return;let r=K.getBoundingClientRect(),i=(e.clientX-r.left)/r.width,a=(e.clientY-r.top)/r.height;n(m.cx+(i-.5)*m.w,m.cy+(.5-a)*m.w,m.w)});function r(t,n){let r=A(t);r.addEventListener(`change`,()=>{f[n]=r.checked,e.markDirty()})}r(`sphereOn`,`sphere`),r(`shadowsOn`,`shadows`),r(`crtOn`,`crt`);let i=[`sphX`,`sphY`,`sphAlt`].map(e=>A(e)),a=A(`sphereSec`);function u(){i.forEach(e=>{e.disabled=!f.sphere}),a.style.opacity=f.sphere?``:`0.45`}A(`sphereOn`).addEventListener(`change`,u),u();function g(t,n,r){let i=A(t),a=A(`${t}V`);i.addEventListener(`input`,()=>{f[n]=parseFloat(i.value),a.textContent=r(i.value),e.markDirty()})}g(`sphX`,`sphX`,e=>parseFloat(e).toFixed(2)),g(`sphY`,`sphY`,e=>parseFloat(e).toFixed(2)),g(`sphAlt`,`sphAlt`,e=>(parseFloat(e)>=0?`+`:``)+parseFloat(e).toFixed(2)),g(`az`,`az`,e=>`${e}°`),g(`el`,`el`,e=>`${e}°`),g(`sunI`,`sunI`,e=>parseFloat(e).toFixed(2)),g(`beta`,`beta`,e=>parseFloat(e).toFixed(1)),A(`grid`).addEventListener(`change`,n=>{f.grid=parseInt(n.target.value,10),t.computing||e.recompute()}),A(`reset`).addEventListener(`click`,()=>{Object.assign(p,l),e.markDirty()});let _=A(`panel`),v=A(`panelToggle`);function y(e){_.classList.toggle(`collapsed`,e),v.textContent=e?`+`:`−`,v.title=e?`Expand panel`:`Collapse panel`,v.setAttribute(`aria-expanded`,String(!e))}return v.addEventListener(`click`,()=>y(!_.classList.contains(`collapsed`))),w&&y(!0),C&&(A(`hint`).innerHTML=`one finger — orbit &nbsp;·&nbsp; pinch — zoom<br>two-finger drag — pan<br>double-tap terrain — dive into the set ×2`),J(),{setWindow:n}}C&&document.documentElement.classList.add(`touch`);var Y=document.getElementById(`gl`),oe=document.getElementById(`minimap`),X;try{X=new re(Y)}catch(e){throw L(`<b>WebGL2 is required</b><br>${e.message}`),e}var Z=new T;function Q(){J(),ie(`Computing potential field… ${f.grid} × ${f.grid} · ${u(m.w)} iterations`),Z.compute(f.grid,m,F).then(()=>{Z.data&&X.uploadField(Z.data,Z.n),te(oe,Z),J(),I(),v()})}var se=ae({recompute:Q,markDirty:v,field:Z});S(Y,Z,{markDirty:v,onDive(e,t){if(Z.computing||!Z.data)return;let n=x(Z,Y,e,t);if(!n)return;let[r,i]=g(n[0],n[1]);p.tx=0,p.ty=0,se.setWindow(r,i,m.w/2)}});function ce(){let e=f.az*Math.PI/180,t=f.el*Math.PI/180;return[Math.cos(t)*Math.cos(e),Math.cos(t)*Math.sin(e),Math.sin(t)]}function $(){if(Z.data&&y()){let e={basis:b(Z),sunDir:ce(),sunI:f.sunI,beta:f.beta,sphereOn:f.sphere,sphereX:f.sphX,sphereY:f.sphY,sphereZ:Z.sphereZ(),shadows:f.shadows,crt:f.crt};X.draw(e)}requestAnimationFrame($)}window.addEventListener(`resize`,v),requestAnimationFrame($),Q();