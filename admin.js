import {
  auth, db, ADMIN_EMAIL, onAuthStateChanged, signOut,
  collection, addDoc, getDocs, query, orderBy, deleteDoc, doc,
  serverTimestamp
} from "./firebase-init.js";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./cloudinary-config.js";

const form = document.getElementById("uploadForm");
const list = document.getElementById("assignmentList");
const msg = document.getElementById("message");
function message(t, ok=false){ msg.textContent=t; msg.className="message "+(ok?"success":"error"); }
function isAdmin(user){ return user && (user.email||"").toLowerCase() === ADMIN_EMAIL.toLowerCase(); }

onAuthStateChanged(auth, user => {
  if (!isAdmin(user)) { location.href="login.html"; return; }
  loadAssignments().catch(e=>message(e.message));
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const user=auth.currentUser;
  if(!isAdmin(user)) return message("Admin access required.");
  const file=document.getElementById("file").files[0];
  if(!file) return message("Please select a file.");
  if(file.size > 10*1024*1024) return message("File must be smaller than 10 MB.");
  if(CLOUDINARY_CLOUD_NAME.startsWith("PASTE_") || CLOUDINARY_UPLOAD_PRESET.startsWith("PASTE_"))
    return message("Cloudinary Cloud Name and Upload Preset are not configured yet.");
  try {
    message("Uploading...");
    const data=new FormData();
    data.append("file",file);
    data.append("upload_preset",CLOUDINARY_UPLOAD_PRESET);
    const endpoint=`https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/auto/upload`;
    const res=await fetch(endpoint,{method:"POST",body:data});
    const result=await res.json();
    if(!res.ok || !result.secure_url) throw new Error(result.error?.message || "Cloudinary upload failed.");
    await addDoc(collection(db,"assignments"),{
      title:document.getElementById("title").value.trim(),
      subject:document.getElementById("subject").value.trim(),
      description:document.getElementById("description").value.trim(),
      fileName:file.name, fileUrl:result.secure_url,
      publicId:result.public_id || "", uploadedBy:user.email,
      createdAt:serverTimestamp()
    });
    form.reset(); message("Assignment uploaded successfully.",true); await loadAssignments();
  } catch(e){ message(e.message); }
});

async function loadAssignments(){
  const snap=await getDocs(query(collection(db,"assignments"),orderBy("createdAt","desc")));
  list.innerHTML="";
  snap.forEach(d=>{
    const a=d.data(); const card=document.createElement("div"); card.className="assignment-card";
    card.innerHTML=`<h3>${escapeHtml(a.title||"Assignment")}</h3><p><b>Subject:</b> ${escapeHtml(a.subject||"")}</p><p>${escapeHtml(a.description||"")}</p><a class="primary-btn inline" href="${escapeAttr(a.fileUrl)}" target="_blank" rel="noopener">View</a><button class="danger-btn" data-id="${d.id}">Delete</button>`;
    list.appendChild(card);
  });
  document.querySelectorAll(".danger-btn").forEach(btn=>btn.onclick=async()=>{
    if(!confirm("Delete this assignment record? The Cloudinary file itself is not deleted automatically."))return;
    try{await deleteDoc(doc(db,"assignments",btn.dataset.id));await loadAssignments();}catch(e){message(e.message);}
  });
}
document.getElementById("logoutBtn").onclick=async()=>{await signOut(auth);location.href="login.html";};
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function escapeAttr(s){return escapeHtml(s);}
