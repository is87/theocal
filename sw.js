const cacheName = "data-v1";
const staticAssets = [
    "./hammer.js",
    "./manifest.json",
    "./index.html",
    "./index.js"
];
self.addEventListener("install", async e => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
});

self.addEventListener("activate", e => {
    self.clients.claim();
})

self.addEventListener('message', function(event){
    console.log("SW Received Message: " + event.data);
    caches.keys().then(function(names) {
        for (let name of names)
            caches.delete(name);
    });
});

self.addEventListener("fetch", async e => {
    const req = e.request;
    const url = new URL(req.url);
    //console.log(url);
    /*if(url.origin === location.origin){
        e.respondWith(cacheFirst(req));
    }else{*/
        e.respondWith(networkAndCache(req));
    //}
});

async function cacheFirst(req){
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    //console.log("Fetching cached file");
    return cached || fetch(req);
}

async function networkAndCache(req){
    const cache = await caches.open(cacheName);
    try{
        const fresh = await fetch(req);
        await cache.put(req, fresh.clone());
        //console.log("Fetching new file");
        return fresh;
    } catch(e){
        const cached = await cache.match(req);
        //console.log("Fetching cached file");
        return cached;
    }
}