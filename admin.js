(function(){
const C=window.FIREBASE_CONFIG;
if(!C||!C.apiKey){const w=()=>{if(location.hash==="#admin")alert("Admin is not set up: firebase-config.js is empty or was not found. See README.md.")};addEventListener("hashchange",w);w();return}
const STATIC=P.slice();let db,auth,user=null,CATS=[],REMOTE=false;
const css=document.createElement("style");
css.textContent="#adm{display:none;position:fixed;inset:0;z-index:99;background:var(--bg);color:var(--ink);overflow:auto;font:15px Karla,system-ui,sans-serif;padding:0 20px 60px}#adm h2{font:400 30px 'Gilda Display',Georgia,serif;margin:0 0 14px}.a-wrap{max-width:860px;margin:0 auto}.a-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:22px 0;border-bottom:1px solid var(--line);margin-bottom:22px}.a-brand{font:400 26px 'Gilda Display',Georgia,serif}.a-brand small{display:block;font:11px Karla,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:var(--mut)}#adm label{display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);margin-top:14px}#adm input,#adm select,#adm textarea{display:block;width:100%;box-sizing:border-box;margin:6px 0 4px;padding:13px 14px;background:var(--card);color:var(--ink);border:1px solid var(--line);font:inherit;border-radius:0}#adm input:focus,#adm select:focus,#adm textarea:focus{outline:0;border-color:var(--ink)}#adm button{padding:13px 22px;margin:4px 6px 4px 0;border:1px solid var(--ink);background:var(--ink);color:var(--bg);cursor:pointer;font:500 13px Karla,sans-serif;letter-spacing:.08em;text-transform:uppercase}#adm button.g{background:transparent;color:var(--ink);border-color:var(--line)}#adm button.r{background:transparent;color:var(--acc);border-color:var(--acc)}#adm button.a-link{background:none;border:0;padding:0;margin:8px 0;color:var(--mut);text-decoration:underline;text-transform:none;letter-spacing:0;font-size:13px}.a-card{background:var(--card);border:1px solid var(--line);padding:34px 30px;max-width:440px;margin:50px auto}.a-row{display:flex;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}.a-row img{width:56px;height:56px;object-fit:cover}.a-row div{flex:1;min-width:0}.a-row small{color:var(--mut)}.pw{position:relative}.pw input{padding-right:50px}#adm .pw button{position:absolute;right:4px;top:7px;margin:0;padding:8px 10px;background:none;border:0;color:var(--mut);line-height:0}#a-m,#f-m{color:var(--acc);font-size:13px;min-height:18px}";document.head.appendChild(css);
const load=src=>new Promise((r,j)=>{const e=document.createElement("script");e.src=src;e.onload=r;e.onerror=j;document.head.appendChild(e)});
const V="https://www.gstatic.com/firebasejs/10.12.2/firebase-";
const esc=t=>String(t==null?"":t).replace(/"/g,"&quot;").replace(/</g,"&lt;");
async function init(){
 try{
  await load(V+"app-compat.js");await Promise.all([load(V+"auth-compat.js"),load(V+"firestore-compat.js")]);
  firebase.initializeApp(C);db=firebase.firestore();auth=firebase.auth();
  await refresh();
  auth.onAuthStateChanged(u=>{user=u;if(location.hash==="#admin")panel()});
 }catch(e){console.error(e);if(location.hash==="#admin")alert("Admin could not start: "+(e&&e.message||"could not load Firebase")+". Check firebase-config.js and your connection.")}
}
async function refresh(){
 try{
  const [ps,m]=await Promise.all([db.collection("products").get(),db.doc("meta/categories").get()]);
  REMOTE=!ps.empty;
  if(REMOTE){P=ps.docs.map(d=>d.data());P.forEach(p=>p.src=p.img);P.sort((a,b)=>(b.order||0)-(a.order||0))}
  CATS=m.exists?m.data().list:[...new Set(P.map(p=>p.cat))];
 }catch(e){console.error(e)}
 buildNav(CATS.filter(c=>P.some(p=>p.cat===c)));render();renderCart();
}
function shrink(file){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>{const k=Math.min(1,900/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.75))};i.onerror=rej;i.src=URL.createObjectURL(file)})}
const box=()=>{let o=$("#adm");if(!o){o=document.createElement("div");o.id="adm";document.body.appendChild(o)}o.style.display="block";return o};
const closeA=()=>{location.hash="";const o=$("#adm");if(o)o.style.display="none"};
addEventListener("hashchange",()=>{if(location.hash==="#admin")panel();else{const o=$("#adm");if(o)o.style.display="none"}});
function panel(){
 const o=box();
 if(!user){
  o.innerHTML='<div class="a-card"><div class="a-brand"><small>Styles by</small>Shahoda</div><h2 style="margin-top:26px">Admin sign in</h2><label>Email</label><input id="a-e" type="email" autocomplete="username"><label>Password</label><div class="pw"><input id="a-p" type="password" autocomplete="current-password"><button type="button" id="a-eye" aria-label="Show password"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div><button id="a-l" style="width:100%;margin-top:18px">Sign in</button><button class="a-link" id="a-f">Forgot password?</button><p id="a-m"></p><button class="a-link" id="a-x">Back to the shop</button></div>';
  const go=()=>auth.signInWithEmailAndPassword($("#a-e").value.trim(),$("#a-p").value).catch(()=>$("#a-m").textContent="Wrong email or password.");
  $("#a-l").onclick=go;o.querySelectorAll("#a-e,#a-p").forEach(i=>i.onkeydown=e=>{if(e.key==="Enter")go()});
  $("#a-eye").onclick=()=>{const p=$("#a-p"),h=p.type==="password";p.type=h?"text":"password";$("#a-eye").innerHTML=h?`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.6 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.200-1M9.900 9.900a3 3 0 0 0 4.200 4.200"/></svg>`:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`;$("#a-eye").setAttribute("aria-label",h?"Hide password":"Show password")};
  $("#a-f").onclick=async()=>{const e=$("#a-e").value.trim(),m=$("#a-m");if(!e){m.textContent="Type your email above first.";return}try{await auth.sendPasswordResetEmail(e);m.textContent="If that email has an admin account, a reset link is on its way. Check spam too."}catch(x){m.textContent=x.code==="auth/invalid-email"?"That email does not look right.":"Could not send the email. Try again in a minute."}};
  $("#a-x").onclick=closeA;return}
 o.innerHTML='<div class="a-wrap"><div class="a-bar"><div class="a-brand"><small>Styles by</small>Shahoda</div><div><button id="a-n">Add product</button><button class="g" id="a-c">Categories</button><button class="g" id="a-o">Sign out</button><button class="g" id="a-x">Close</button></div></div><p style="color:var(--mut);margin:0 0 16px">Signed in as '+esc(user.email)+'</p>'+(REMOTE?"":'<p>The shop is still showing the built-in products. <button id="a-i">Import the '+STATIC.length+' current products so I can edit them</button></p>')
  +'<div id="a-l">'+P.map(p=>'<div class="a-row"><img src="'+esc(p.src)+'"><div><b>'+esc(p.name)+'</b><br><small>'+esc(p.cat)+' · '+(p.price?p.price+" "+CURRENCY:"no price")+'</small></div>'+(REMOTE?'<button data-e="'+p.id+'">Edit</button><button class="r" data-d="'+p.id+'">Delete</button>':"")+'</div>').join("")+'</div></div>';
 $("#a-x").onclick=closeA;$("#a-o").onclick=()=>auth.signOut();$("#a-n").onclick=()=>form(null);$("#a-c").onclick=cpanel;
 if($("#a-i"))$("#a-i").onclick=imp;
 o.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>form(G(b.dataset.e)));
 o.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this product?")){await db.collection("products").doc(b.dataset.d).delete();await refresh();panel()}});
}
async function imp(){
 const b=db.batch();STATIC.forEach((p,i)=>b.set(db.collection("products").doc(String(p.id)),{id:p.id,name:p.name,cat:p.cat,price:p.price||null,desc:p.desc||"",cap:p.cap?1:0,img:p.img,badge:p.badge||"",order:1000-i}));
 b.set(db.doc("meta/categories"),{list:[...new Set(STATIC.map(p=>p.cat))]});await b.commit();await refresh();panel();
}
function form(p){
 const o=box();
 o.innerHTML='<div class="a-card" style="max-width:520px;margin:30px auto"><h2>'+(p?"Edit":"Add")+' product</h2><label>Name</label><input id="f-n" value="'+esc(p&&p.name)+'"><label>Category</label><select id="f-c">'+CATS.map(c=>'<option'+(p&&p.cat===c?" selected":"")+'>'+esc(c)+'</option>').join("")+'</select><label>Price ('+CURRENCY+'), leave empty for "Price on WhatsApp"</label><input id="f-p" type="number" min="0" value="'+(p&&p.price||"")+'"><label>Description</label><textarea id="f-d" rows="5" dir="auto">'+esc(p&&(p.desc||"").replace(/<br>/g,"\n"))+'</textarea><label>Photo'+(p?" (leave empty to keep the current one)":"")+'</label><input id="f-i" type="file" accept="image/*"><button id="f-s">Save</button><button class="g" id="f-x">Cancel</button><p id="f-m"></p></div>';
 $("#f-x").onclick=panel;
 $("#f-s").onclick=async()=>{
  const name=$("#f-n").value.trim(),cat=$("#f-c").value,f=$("#f-i").files[0],m=$("#f-m");
  if(!name||!cat){m.textContent="Name and category are required.";return}
  if(!p&&!f){m.textContent="Choose a photo.";return}
  m.textContent="Saving...";
  try{
   const id=p?p.id:Date.now(),desc=$("#f-d").value.trim().replace(/\n/g,"<br>"),img=f?await shrink(f):p.img;
   await db.collection("products").doc(String(id)).set({id,name,cat,price:+$("#f-p").value||null,desc,cap:desc?1:0,img,badge:p&&p.badge||"",order:p?p.order:Date.now()});
   await refresh();panel();
  }catch(e){m.textContent="Could not save: "+e.message}
 };
}
function cpanel(){
 const o=box(),used=c=>P.some(p=>p.cat===c);
 o.innerHTML='<div class="a-card" style="max-width:520px;margin:30px auto"><h2>Categories</h2>'+CATS.map(c=>'<div class="a-row"><div>'+esc(c)+' <small>('+P.filter(p=>p.cat===c).length+')</small></div>'+(used(c)?"":'<button class="r" data-x="'+esc(c)+'">Delete</button>')+'</div>').join("")+'<input id="k-n" placeholder="New category name"><button id="k-a">Add category</button><button class="g" id="k-x">Back</button></div>';
 $("#k-x").onclick=panel;
 const savec=async l=>{await db.doc("meta/categories").set({list:l});await refresh();cpanel()};
 $("#k-a").onclick=()=>{const n=$("#k-n").value.trim().replace(/"/g,"");if(n&&!CATS.includes(n))savec([...CATS,n])};
 o.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>savec(CATS.filter(c=>c!==b.dataset.x)));
}
init().then(()=>{if(location.hash==="#admin")panel()});
})();
