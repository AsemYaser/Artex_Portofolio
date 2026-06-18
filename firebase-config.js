/* ============================================
   FIREBASE CONFIGURATION — Artex Studio
   ============================================
   Requires firebase-app-compat.js to be loaded
   before this script via <script> tag.
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCAydj3iKYcN6CknexTDWmJ_hZ2fD8c_eM",
  authDomain: "artex-studio.firebaseapp.com",
  projectId: "artex-studio",
  storageBucket: "artex-studio.firebasestorage.app",
  messagingSenderId: "125298311809",
  appId: "1:125298311809:web:b64d9d690535f0d6e34380",
  measurementId: "G-B2FP4YLDDD"
};

// Initialize Firebase (only once)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
