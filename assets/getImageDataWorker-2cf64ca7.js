(function(){"use strict";const c=(t,a,o,n,i)=>{t.beginPath(),t.moveTo(a,o);for(let e=1;e<=i;e++){const s=e%2===0?10:-10;t.lineTo(a+s,o+(n-o)*(e/i))}t.stroke()};onmessage=t=>{const{filteredColors:a,pixelTimes:o,margins:n,numSquiggles:i,panelWidth:e,panelHeight:s}=t.data,r=new OffscreenCanvas(e,s).getContext("2d");r&&(o.forEach((g,l)=>{r.strokeStyle=a[l],c(r,g,n.top,s-n.bottom,i)}),postMessage({imageData:r.getImageData(0,0,e,s)}))}})();
