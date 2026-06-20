import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export default function HeroBlobCanvas({ textRefs }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    /* ════════════════════════════════════════════════════════════════════════
       RENDERER
       ════════════════════════════════════════════════════════════════════════ */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    
    if (canvasRef.current) {
        canvasRef.current.appendChild(renderer.domElement);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    /* ════════════════════════════════════════════════════════════════════════
       PARTICLES — Float32Array, scalable & zero-texture
       ════════════════════════════════════════════════════════════════════════ */
    const NP = 4200;
    const pp = new Float32Array(NP * 3);
    const pc = new Float32Array(NP * 3);
    const ps = new Float32Array(NP);

    for (let i = 0; i < NP; i++) {
      const r = 6.0 + Math.random() * 18.0;
      const theta = Math.random() * Math.PI * 2.0;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      pp[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pp[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pp[i * 3 + 2] = r * Math.cos(phi);

      const rn = Math.random();
      if (rn < 0.54) {                    /* purple */
        pc[i * 3] = .25 + Math.random() * .3; pc[i * 3 + 1] = .01; pc[i * 3 + 2] = .50 + Math.random() * .4;
      } else if (rn < 0.80) {             /* magenta */
        pc[i * 3] = .55 + Math.random() * .4; pc[i * 3 + 1] = .04; pc[i * 3 + 2] = .68 + Math.random() * .3;
      } else {                            /* white-blue */
        pc[i * 3] = .65 + Math.random() * .3; pc[i * 3 + 1] = .55 + Math.random() * .2; pc[i * 3 + 2] = 1.0;
      }
      ps[i] = 0.3 + Math.random() * 2.5;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(pc, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(ps, 1));

    const pU = { uTime: { value: 0.0 } };
    const pMat = new THREE.ShaderMaterial({
      uniforms: pU,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        attribute vec3  aColor;
        attribute float aSize;
        varying vec3    vColor;
        uniform float   uTime;
        void main(){
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float tw = .55 + .45*sin(uTime*1.2 + position.x*4.6 + position.y*2.2 + position.z*3.1);
          gl_PointSize  = aSize * tw * (290.0 / -mv.z);
          gl_Position   = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main(){
          float d = length(gl_PointCoord - .5);
          if(d > .5) discard;
          float a = 1.0 - smoothstep(.12, .5, d);
          gl_FragColor = vec4(vColor, a * .65);
        }
      `,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    /* ════════════════════════════════════════════════════════════════════════
       NOISE LIBRARY  (Stefan Gustavson Simplex 3D + 5-octave FBM)
       ════════════════════════════════════════════════════════════════════════ */
    const NOISE = `
      vec3  _m3(vec3  x){ return x-floor(x*(1./289.))*289.; }
      vec4  _m4(vec4  x){ return x-floor(x*(1./289.))*289.; }
      vec4  _pm(vec4  x){ return _m4(((x*34.)+1.)*x); }
      vec4  _ti(vec4  r){ return 1.79284291400159-.85373472095314*r; }

      float snoise(vec3 v){
        const vec2 C=vec2(1./6.,1./3.);
        const vec4 D=vec4(0.,.5,1.,2.);
        vec3 i =floor(v+dot(v,C.yyy));
        vec3 x0=v-i+dot(i,C.xxx);
        vec3 g =step(x0.yzx,x0.xyz);
        vec3 l =1.-g;
        vec3 i1=min(g.xyz,l.zxy);
        vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
        i=_m3(i);
        vec4 p=_pm(_pm(_pm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
        float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
        vec4 j=p-49.*floor(p*ns.z*ns.z);
        vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
        vec4 xv=x_*ns.x+ns.yyyy; vec4 yv=y_*ns.x+ns.yyyy;
        vec4 h=1.-abs(xv)-abs(yv);
        vec4 b0=vec4(xv.xy,yv.xy); vec4 b1=vec4(xv.zw,yv.zw);
        vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.;
        vec4 sh=-step(h,vec4(0.));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
        vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
        vec4 nm=_ti(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=nm.x; p1*=nm.y; p2*=nm.z; p3*=nm.w;
        vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
        m=m*m;
        return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }

      float fbm(vec3 p){
        float v=0.,a=.52,f=1.;
        for(int i=0;i<5;i++){ v+=a*snoise(p*f); f*=2.05; a*=.5; }
        return v;
      }
    `;

    /* ════════════════════════════════════════════════════════════════════════
       BLOB — SphereGeometry(1.5, 256, 256) + custom vertex/fragment shaders
       ════════════════════════════════════════════════════════════════════════ */
    const blobVert = NOISE + `
      uniform float uTime;
      uniform float uStr;
      varying vec3  vWN;    /* world normal  */
      varying vec3  vWP;    /* world pos     */
      varying float vN;     /* noise value   */

      void main(){
        float n = fbm(position * 1.10 + uTime * 0.30);

        /* finite-difference normal reconstruction */
        const float E = 0.025;
        float nx = fbm((position+vec3(E,0.,0.))*1.1+uTime*.3) - fbm((position-vec3(E,0.,0.))*1.1+uTime*.3);
        float ny = fbm((position+vec3(0.,E,0.))*1.1+uTime*.3) - fbm((position-vec3(0.,E,0.))*1.1+uTime*.3);
        float nz = fbm((position+vec3(0.,0.,E))*1.1+uTime*.3) - fbm((position-vec3(0.,0.,E))*1.1+uTime*.3);
        vec3 grad = vec3(nx,ny,nz)/(2.*E);
        vec3 dN   = normalize(normal - grad * uStr);

        vec3 disp = position + normal * n * uStr;
        vN  = n;
        vWN = normalize((modelMatrix * vec4(dN,0.)).xyz);
        vWP = (modelMatrix * vec4(disp,1.)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vWP,1.);
      }
    `;

    const blobFrag = `
      uniform vec3  uCP;      /* camera position   */
      uniform vec3  uColA;    /* peak  #CC44FF     */
      uniform vec3  uColB;    /* mid   #4422AA     */
      uniform vec3  uColC;    /* dark  #1A0A2E     */
      uniform float uEm;      /* 0..1, GSAP-driven */

      varying vec3  vWN;
      varying vec3  vWP;
      varying float vN;

      void main(){
        vec3  N  = normalize(vWN);
        vec3  V  = normalize(uCP - vWP);
        float NV = max(dot(N,V), 0.0);

        /* Fresnel rim (matches spec pow=3.0) */
        float fr  = pow(1.0-NV, 3.0);
        float fr2 = pow(1.0-NV, 1.5);

        /* GSAP-cycled emissive colour */
        vec3 em = mix(uColC, mix(uColB, uColA, uEm), uEm);

        /* Procedural dark body with noise-based micro-variation */
        float nA   = vN * .5 + .5;
        vec3  body = mix(vec3(.030,.004,.10), vec3(.100,.018,.22), nA);

        /* Compose: body + Fresnel rim + inner SSS bleed */
        vec3 col = body;
        col += em * fr  * 1.75;
        col += em * fr2 * uEm * .55;
        col += em * (1.-NV) * uEm * .30;

        /* Specular */
        vec3  L  = normalize(vec3(1.2,1.5,1.0));
        float sp = pow(max(dot(reflect(-L,N),V),0.),44.0);
        col += vec3(.50,.18,.88) * sp * .28;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const blobU = {
      uTime: { value: 0.0 },
      uStr:  { value: 0.62 },
      uCP:   { value: camera.position },
      uColA: { value: new THREE.Color(0xCC44FF) },
      uColB: { value: new THREE.Color(0x4422AA) },
      uColC: { value: new THREE.Color(0x1A0A2E) },
      uEm:   { value: 0.0 },   /* starts at 0 — GSAP entrance will open it */
    };

    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 256, 256),
      new THREE.ShaderMaterial({ vertexShader: blobVert, fragmentShader: blobFrag, uniforms: blobU })
    );

    /* Position blob on the RIGHT side of the viewport */
    blob.position.set(1.85, 0.0, 0.0);
    blob.scale.setScalar(0.0);   /* starts invisible — GSAP entrance */
    scene.add(blob);

    /* ════════════════════════════════════════════════════════════════════════
       POST-PROCESSING
       ════════════════════════════════════════════════════════════════════════ */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight),
      0.0,   /* starts at 0, GSAP opens it */
      0.80,
      0.30
    );
    composer.addPass(bloom);

    /* ════════════════════════════════════════════════════════════════════════
       GSAP — ENTRANCE + LOOP
       ════════════════════════════════════════════════════════════════════════ */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Ensure opacity is zero before animation starts
    let textElements = [];
    if (textRefs) {
      if (textRefs.badgeRef && textRefs.badgeRef.current) textElements.push(textRefs.badgeRef.current);
      if (textRefs.h1Ref && textRefs.h1Ref.current) textElements.push(textRefs.h1Ref.current);
      if (textRefs.subRef && textRefs.subRef.current) textElements.push(textRefs.subRef.current);
      if (textRefs.ctasRef && textRefs.ctasRef.current) textElements.push(textRefs.ctasRef.current);
      if (textRefs.statsRef && textRefs.statsRef.current) textElements.push(textRefs.statsRef.current);
    }
    
    if(textElements.length > 0) {
        gsap.set(textElements, { y: 22, opacity: 0 });
        
        let staggers = [0.35, 0.50, 0.65, 0.80, 0.95];
        textElements.forEach((el, index) => {
             tl.to(el, { opacity: 1, y: 0, duration: 0.8 }, staggers[index] || 0.95);
        });
    }

    /* Blob scales in */
    const bScale = { s: 0.0, em: 0.0, bloom: 0.0 };
    tl.to(bScale, {
      s: 1.0, em: 1.0, bloom: 1.5,
      duration: 1.8,
      ease: 'back.out(1.15)',
      onUpdate() {
        blob.scale.setScalar(bScale.s);
        blobU.uEm.value  = bScale.em;
        bloom.strength   = bScale.bloom;
      },
    }, 0.55);

    /* Continuous emission cycle (ease-in-out sine) */
    const loopState = { em: 1.0, bloom: 1.5 };
    gsap.to(loopState, {
      em: 0.06, bloom: 0.32,
      duration: 3.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2.4,   /* start after entrance finishes */
      onUpdate() {
        blobU.uEm.value = loopState.em;
        bloom.strength  = loopState.bloom;
      },
    });

    /* ════════════════════════════════════════════════════════════════════════
       SUBTLE MOUSE PARALLAX — blob drifts very gently toward cursor
       ════════════════════════════════════════════════════════════════════════ */
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / innerWidth  - 0.5) *  0.30;
      mouse.y = (e.clientY / innerHeight - 0.5) * -0.20;
    };
    window.addEventListener('mousemove', onMouseMove);

    /* ════════════════════════════════════════════════════════════════════════
       RESIZE
       ════════════════════════════════════════════════════════════════════════ */
    const onResize = () => {
        /* Mobile fallback: Hide blob on screens < 768px */
        if (window.innerWidth < 768) {
            blob.visible = false;
        } else {
            blob.visible = true;
        }
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    /* ════════════════════════════════════════════════════════════════════════
       RENDER LOOP
       ════════════════════════════════════════════════════════════════════════ */
    const clock = new THREE.Clock();
    let animFrameId = null;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      blobU.uTime.value = t;
      pU.uTime.value    = t;

      /* slow Y-axis self-rotation + gentle X drift */
      blob.rotation.y += 0.0010;
      blob.rotation.x += 0.0003;

      /* smooth mouse parallax — offset around the right-side position */
      blob.position.x += (1.85 + mouse.x - blob.position.x) * 0.04;
      blob.position.y += (       mouse.y - blob.position.y) * 0.04;

      composer.render();
    };
    animate();
    
    // Cleanup
    return () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMouseMove);
        if (animFrameId) cancelAnimationFrame(animFrameId);
        
        // Dispose Three.js objects
        renderer.dispose();
        scene.clear();
        tl.kill();
        gsap.killTweensOf(loopState);
        if (canvasRef.current && renderer.domElement) {
            try {
                canvasRef.current.removeChild(renderer.domElement);
            } catch (e) {
                // Ignore if already removed
            }
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
        ref={canvasRef} 
        style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 0, 
            pointerEvents: 'none' 
        }} 
        className="hero-blob-container max-md:bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] max-md:from-accent/20 max-md:via-transparent max-md:to-transparent"
    />
  );
}
