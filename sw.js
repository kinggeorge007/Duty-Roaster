const C="schedule-v14",A=["./","index.html","manifest.json","icon.svg"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=="GET")return;
 const same=u.origin===location.origin,cdn=["cdn.jsdelivr.net","fonts.googleapis.com","fonts.gstatic.com"].includes(u.hostname);
 if(!same&&!cdn)return;
 // open instantly from phone storage, refresh quietly in the background
 e.respondWith(caches.open(C).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>{
  const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}).catch(()=>hit);
  return hit||net})))});
