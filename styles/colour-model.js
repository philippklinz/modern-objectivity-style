/* Colour calculations and paired accent palettes. GPL-2.0-only. */
(function(root){
 'use strict';
 const palettes={signal:['#007E77','#49D9C6'],cobalt:['#275DAD','#8AB8FF'],violet:['#7246A6','#C5A5F5'],copper:['#9B5427','#F0B081'],carmine:['#AD3F64','#F3A0B9'],olive:['#627020','#CAD57B']};
 const stages={light:{canvas:'#F3F7F7',surface:'#FFFFFF',text:'#132C32',strong:'#081D23',muted:'#506970',border:'#AFC3C6'},dark:{canvas:'#08191E',surface:'#10272D',text:'#D7E8E9',strong:'#F4FBFA',muted:'#A2BAC0',border:'#41616B'}};
 const valid=value=>/^#[0-9a-f]{6}$/i.test(value);
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const hex=values=>'#'+values.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();
 function luminance(value){return rgb(value).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function mix(a,b,weight){const other=rgb(b);return hex(rgb(a).map((v,i)=>v*(1-weight)+other[i]*weight));}
 function hsl(value){const [r,g,b]=rgb(value).map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=(max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60;}return [h,s*100,l*100];}
 function fromHsl(h,s,l){s/=100;l/=100;h=((h%360)+360)%360;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(h/60%2-1)),m=l-c/2;const a=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return hex(a.map(v=>(v+m)*255));}
 const ink=background=>contrast('#FFFFFF',background)>=contrast('#000000',background)?'#FFFFFF':'#000000';
 function tokens(accent,mode){const stage=stages[mode],hover=mix(accent,stage.strong,.18);return {accent,hover,soft:mix(accent,stage.surface,mode==='light'?.9:.84),ink:ink(accent),hoverInk:ink(hover),focus:accent};}
 function adjust(accent,mode){const [h,s,l]=hsl(accent),stage=stages[mode];let best=null,distance=Infinity;for(let n=0;n<=1000;n++){const candidate=fromHsl(h,s,n/10);if(Math.min(contrast(candidate,stage.surface),contrast(candidate,stage.canvas))>=4.5&&Math.abs(n/10-l)<distance){best=candidate;distance=Math.abs(n/10-l);}}return best||accent;}
 function css(accents){return ['light','dark'].map(mode=>{const t=tokens(accents[mode],mode);return `${mode==='light'?':root':'[data-theme="dark"]'} {\n  --mo-accent: ${t.accent};\n  --mo-accent-active: ${t.hover};\n  --mo-accent-light: ${t.soft};\n  --mo-accent-glow: ${t.accent};\n  --mo-focus: ${t.focus};\n  --mo-button-bg: ${t.accent};\n  --mo-button-hover: ${t.hover};\n  --mo-on-accent: ${t.ink};\n  --mo-on-accent-hover: ${t.hoverInk};\n}`;}).join('\n\n')+'\n\n.mo-btn-primary {\n  color: var(--mo-on-accent);\n  background: var(--mo-button-bg);\n  border-color: var(--mo-button-bg);\n}\n.mo-btn-primary:hover {\n  color: var(--mo-on-accent-hover);\n  background: var(--mo-button-hover);\n  border-color: var(--mo-button-hover);\n}\n';}
 const api={palettes,stages,valid,rgb,hex,luminance,contrast,mix,hsl,fromHsl,ink,tokens,adjust,css};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.MOColour=api;
})(globalThis);
