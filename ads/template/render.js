const {chromium}=require('playwright');const fs=require('fs');
const [,,h,out,mode]=process.argv;const H=+h;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:H}});
await p.goto('file://'+__dirname+'/'+(process.env.PAGE||'everword-ad-template.html')+'?h='+H);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
fs.mkdirSync(out,{recursive:true});
const times=mode==='stills'?(process.env.TIMES||'1.8,3.2,5.0,7.6,10.0,11.8,15.5').split(',').map(Number):null;
const dur=await p.evaluate(()=>DUR);const n=times?times.length:Math.round(dur*30);
for(let i=0;i<n;i++){const t=times?times[i]:i/30;await p.evaluate(t=>render(t),t);
 await p.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.${times?'png':'jpg'}`,type:times?'png':'jpeg',...(times?{}:{quality:95})});}
await b.close();})();
