(function(){
const C=window.FIREBASE_CONFIG;
if(!C||!C.apiKey){addEventListener("hashchange",()=>{if(location.hash==="#admin")alert("Admin is not set up yet. See README.md.")});return}
const STATIC=P.slice();let db,auth,user=null,CATS=[],REMOTE=false;
const css=document.createElement("style");
css.textContent="#adm{display:none;position:fixed;inset:0;z-index:99;background:#faf7f2;overflow:auto;padding:20px;font:15px system-ui,sans-serif;color:#222}#adm input,#adm select,#adm textarea{display:block;width:100%;max-width:420px;margin:6px 0 12px;padding:10px;border:1px solid #ccc;border-radius:8px;font:inherit}#adm button{padding:9px 14px;margin:2px;border:0;border-radius:8px;background:#222;color:#fff;cursor:pointer;font:inherit}#adm button.g{background:#ddd;color:#222}#adm button.r{background:#b3261e}.a-row{display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid #e5dfd5}.a-row img{width:52px;height:52px;object-fit:cover;border-radius:8px}.a-row div{flex:1;min-width:0}.a-box{max-width:420px;margin:60px auto}";
document.head.appendChild(css);
const load=src=>new Promise((r,j)=>{const e=document.createElement("script");e.src=src;e.onload=r;e.onerror=j;document.head.appendChild(e)});
const V="https://www.gstatic.com/firebasejs/10.12.2/firebase-";
const esc=t=>String(t==null?"":t).replace(/"/g,"&quot;").replace(/</g,"&lt;");
async function init(){
 try{
  await load(V+"app-compat.js");await Promise.all([load(V+"auth-compat.js"),load(V+"firestore-compat.js")]);
  firebase.initializeApp(C);db=firebase.firestore();auth=firebase.auth();
  await refresh();
  auth.onAuthStateChanged(u=>{user=u;if(location.hash==="#admin")panel()});
 }catch(e){console.error(e)}
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
  o.innerHTML='<div class="a-box"><h2>Admin login</h2><input id="a-e" type="email" placeholder="Email"><input id="a-p" type="password" placeholder="Password"><button id="a-l">Sign in</button><button class="g" id="a-x">Close</button><p id="a-m"></p></div>';
  $("#a-l").onclick=()=>auth.signInWithEmailAndPassword($("#a-e").value.trim(),$("#a-p").value).catch(()=>$("#a-m").textContent="Wrong email or password");
  $("#a-x").onclick=closeA;return}
 o.innerHTML='<div><b>Admin</b> · '+esc(user.email)+' <button id="a-n">Add product</button><button class="g" id="a-c">Categories</button><button class="g" id="a-o">Sign out</button><button class="g" id="a-x">Close</button></div>'
  +(REMOTE?"":'<p>The shop is still showing the built-in products. <button id="a-i">Import the '+STATIC.length+' current products so I can edit them</button></p>')
  +'<div id="a-l">'+P.map(p=>'<div class="a-row"><img src="'+esc(p.src)+'"><div><b>'+esc(p.name)+'</b><br><small>'+esc(p.cat)+' · '+(p.price?p.price+" "+CURRENCY:"no price")+'</small></div>'+(REMOTE?'<button data-e="'+p.id+'">Edit</button><button class="r" data-d="'+p.id+'">Delete</button>':"")+'</div>').join("")+'</div>';
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
 o.innerHTML='<div class="a-box" style="margin-top:20px"><h2>'+(p?"Edit":"Add")+' product</h2><label>Name</label><input id="f-n" value="'+esc(p&&p.name)+'"><label>Category</label><select id="f-c">'+CATS.map(c=>'<option'+(p&&p.cat===c?" selected":"")+'>'+esc(c)+'</option>').join("")+'</select><label>Price ('+CURRENCY+'), leave empty for "Price on WhatsApp"</label><input id="f-p" type="number" min="0" value="'+(p&&p.price||"")+'"><label>Description</label><textarea id="f-d" rows="5" dir="auto">'+esc(p&&(p.desc||"").replace(/<br>/g,"\n"))+'</textarea><label>Photo'+(p?" (leave empty to keep the current one)":"")+'</label><input id="f-i" type="file" accept="image/*"><button id="f-s">Save</button><button class="g" id="f-x">Cancel</button><p id="f-m"></p></div>';
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
 o.innerHTML='<div class="a-box" style="margin-top:20px"><h2>Categories</h2>'+CATS.map(c=>'<div class="a-row"><div>'+esc(c)+' <small>('+P.filter(p=>p.cat===c).length+')</small></div>'+(used(c)?"":'<button class="r" data-x="'+esc(c)+'">Delete</button>')+'</div>').join("")+'<input id="k-n" placeholder="New category name"><button id="k-a">Add category</button><button class="g" id="k-x">Back</button></div>';
 $("#k-x").onclick=panel;
 const savec=async l=>{await db.doc("meta/categories").set({list:l});await refresh();cpanel()};
 $("#k-a").onclick=()=>{const n=$("#k-n").value.trim().replace(/"/g,"");if(n&&!CATS.includes(n))savec([...CATS,n])};
 o.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>savec(CATS.filter(c=>c!==b.dataset.x)));
}
init().then(()=>{if(location.hash==="#admin")panel()});
})();
