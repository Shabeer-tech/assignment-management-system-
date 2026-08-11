import {
  auth, db, signOut, onAuthStateChanged, collection, getDocs, query, orderBy
} from "./firebase-init.js";

const list = document.getElementById("assignmentList");
const msg = document.getElementById("message");
const welcome = document.getElementById("welcome");

function showMessage(t) { msg.textContent = t; }

onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "login.html";
  welcome.textContent = `Hi, ${user.displayName || user.email}`;
  try {
    const snap = await getDocs(query(collection(db, "assignments"), orderBy("createdAt", "desc")));
    list.innerHTML = "";
    if (snap.empty) {
      list.innerHTML = '<p class="muted">No assignments uploaded yet.</p>';
      return;
    }
    snap.forEach(d => {
      const a = d.data();
      const card = document.createElement("div");
      card.className = "assignment-card";
      card.innerHTML = `
        <h3>${escapeHtml(a.title || "Assignment")}</h3>
        <p><b>Subject:</b> ${escapeHtml(a.subject || "-")}</p>
        <p>${escapeHtml(a.description || "")}</p>
        <button class="primary-btn inline view-btn" type="button">
        View / Download
        </button>
      `;
      list.appendChild(card);
      const viewBtn = card.querySelector(".view-btn");

      viewBtn.addEventListener("click", () => {
        if (!a.fileUrl) {
          alert("Assignment file not found.");
          return;
        }

        window.open(a.fileUrl, "_blank", "noopener,noreferrer");
      });

    });
  } catch (e) { showMessage(e.message); }
});

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.href = "login.html";
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}
