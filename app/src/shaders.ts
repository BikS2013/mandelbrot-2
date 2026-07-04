import { HSCALE, WORLD_MIN, WORLD_SIZE } from './constants';

export const VS = `#version 300 es
void main(){
  vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position=vec4(p*2.0-1.0, 0.0, 1.0);
}`;

export const FS = `#version 300 es
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

const vec2 GMIN=vec2(${WORLD_MIN.toFixed(2)}, ${WORLD_MIN.toFixed(2)});
const vec2 GSIZE=vec2(${WORLD_SIZE.toFixed(2)}, ${WORLD_SIZE.toFixed(2)});
const float H=${HSCALE};
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
}`;
