(function(){
  function toBytes(b64){ if(!b64) return new Uint8Array(); return Uint8Array.from(atob(b64), c=>c.charCodeAt(0)); }
  function toB64(bytes){ let bin=""; for (let i=0;i<bytes.length;i++) bin += String.fromCharCode(bytes[i]); return btoa(bin); }
  async function importKey(keyB64){
    const keyBytes = toBytes(keyB64);
    return await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt','decrypt']);
  }
  async function encrypt(keyB64, plainB64, adB64){
    const key = await importKey(keyB64);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = toBytes(plainB64);
    const params = { name: 'AES-GCM', iv }; // só inclui additionalData se existir
    if (adB64) params.additionalData = toBytes(adB64);
    const ctBuf = await crypto.subtle.encrypt(params, key, plain);
    const full = new Uint8Array(ctBuf);
    const tag = full.slice(full.length - 16);
    const cipher = full.slice(0, full.length - 16);
    return { iv: toB64(iv), c: toB64(cipher), t: toB64(tag) };
  }
  async function decrypt(keyB64, ivB64, cipherB64, tagB64, adB64){
    const key = await importKey(keyB64);
    const iv = toBytes(ivB64);
    const cipher = toBytes(cipherB64);
    const tag = toBytes(tagB64);
    const full = new Uint8Array(cipher.length + tag.length);
    full.set(cipher, 0); full.set(tag, cipher.length);
    const params = { name: 'AES-GCM', iv };
    if (adB64) params.additionalData = toBytes(adB64);
    const plainBuf = await crypto.subtle.decrypt(params, key, full);
    return toB64(new Uint8Array(plainBuf));
  }
  window.cryptoInterop = { encrypt, decrypt };
})();
