import {
  auth, db, googleProvider, ADMIN_EMAIL,
  signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile, setDoc, doc
} from "./firebase-init.js";

const $ = (id) => document.getElementById(id);
const msg = (text, ok=false) => {
  const el = $("message");
  if (el) { el.textContent = text; el.className = "message " + (ok ? "success" : "error"); }
};

const redirectFor = (email) => {
  const safeEmail = (email || "").toLowerCase();
  window.location.href = safeEmail === ADMIN_EMAIL.toLowerCase()
    ? "admin.html" : "dashboard.html";
};

const loginForm = $("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg("Logging in...");
    try {
      const cred = await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
      redirectFor(cred.user.email);
    } catch (err) {
      msg(err.code === "auth/invalid-credential" ? "Wrong email or password." : err.message);
    }
  });
}

const registerForm = $("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if ($("password").value !== $("confirmPassword").value) return msg("Passwords do not match.");
    try {
      const cred = await createUserWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
      await updateProfile(cred.user, {displayName: $("name").value.trim()});
      await setDoc(doc(db, "users", cred.user.uid), {
        name: $("name").value.trim(),
        email: cred.user.email,
        role: "user",
        createdAt: new Date()
      });
      window.location.href = "dashboard.html";
    } catch (err) {
      msg(err.code === "auth/email-already-in-use" ? "This email is already registered." : err.message);
    }
  });
}

const googleBtn = $("googleBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, "users", cred.user.uid), {
        name: cred.user.displayName || "",
        email: cred.user.email,
        role: cred.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
        updatedAt: new Date()
      }, {merge:true});
      redirectFor(cred.user.email);
    } catch (err) {
      msg(err.message);
    }
  });
}

const forgotForm = $("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, $("email").value.trim());
      msg("Password reset link sent. Check your Gmail inbox/spam folder.", true);
    } catch (err) {
      msg(err.code === "auth/user-not-found" ? "No account found with this email." : err.message);
    }
  });
}
