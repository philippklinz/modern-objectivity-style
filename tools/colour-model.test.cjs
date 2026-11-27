'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../styles/colour-model.js');
test('WCAG reference ratios and sRGB conversion',()=>{
 assert.equal(C.contrast('#000000','#FFFFFF'),21);
 assert.equal(C.contrast('#007E77','#007E77'),1);
 assert.ok(Math.abs(C.contrast('#FF0000','#FFFFFF')-3.9984767707539985)<1e-10);
 assert.ok(C.contrast('#777777','#FFFFFF')<4.5);
 assert.ok(C.contrast('#767676','#FFFFFF')>4.5);
});
test('all twelve preset variants support text and both button states',()=>{
 for(const [name,pair] of Object.entries(C.palettes))for(const [i,mode] of ['light','dark'].entries()){
  const accent=pair[i],t=C.tokens(accent,mode),s=C.stages[mode];
  for(const bg of [s.canvas,s.surface])assert.ok(C.contrast(accent,bg)>=4.5,name+'/'+mode);
  assert.ok(C.contrast(t.ink,accent)>=4.5,name+' button');
  assert.ok(C.contrast(t.hoverInk,t.hover)>=4.5,name+' hover');
 }
});
test('contrast repair changes only the supplied accent and meets the threshold',()=>{
 for(const mode of ['light','dark'])for(const accent of ['#FFFF00','#808080','#FFFFFF','#000000','#E0CACA']){
  const repaired=C.adjust(accent,mode),s=C.stages[mode];assert.ok(C.valid(repaired));
  assert.ok(C.contrast(repaired,s.surface)>=4.5);assert.ok(C.contrast(repaired,s.canvas)>=4.5);
 }
});
test('HSL conversion covers primaries, neutrals and hue wraparound',()=>{
 assert.equal(C.fromHsl(0,100,50),'#FF0000');assert.equal(C.fromHsl(120,100,50),'#00FF00');assert.equal(C.fromHsl(240,100,50),'#0000FF');assert.equal(C.fromHsl(360,100,50),'#FF0000');
 for(const value of ['#FFFFFF','#000000','#808080','#007E77','#C5A5F5'])assert.equal(C.fromHsl(...C.hsl(value)),value);
});
test('CSS export retains separate light and dark accents and button tokens',()=>{
 const css=C.css({light:'#275DAD',dark:'#8AB8FF'});assert.match(css,/:root \{/);assert.match(css,/\[data-theme="dark"\]/);assert.match(css,/--mo-accent: #275DAD/);assert.match(css,/--mo-accent: #8AB8FF/);assert.match(css,/--mo-on-accent-hover:/);
});
