// usage: node render3.js <height> <outdir> [stills|video] ; env PAGE, Q (extra query), TIMES
const {chromium}=require('playwright');const fs=require('fs');
const [,,h,out,mode]=process.argv;const H=+h;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:H}});
await p.goto('file://'+__dirname+'/'+(process.env.PAGE||'bfcm.html')+'?h='+H+(process.env.Q?'&'+process.env.Q:''));
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);
fs.mkdirSync(out,{recursive:true});const dur=await p.evaluate(()=>DUR);
const times=mode==='stills'?(process.env.TIMES?process.env.TIMES.split(',').map(Number):[1.5,2.6,3.4,4.6,6.0,dur-.3]):null;
const n=times?times.length:Math.round(dur*30);
for(let i=0;i<n;i++){const t=times?times[i]:i/30;await p.evaluate(t=>render(t),t);
 await p.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.${times?'png':'jpg'}`,type:times?'png':'jpeg',...(times?{}:{quality:94})});}
await b.close();})();
