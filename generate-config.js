const fs = require('fs');

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

if (config.apiKey) {
  const content = `/* ============================================
   FIREBASE CONFIGURATION — Generated at Build Time
   ============================================ */
const firebaseConfig = ${JSON.stringify(config, null, 2)};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
`;
  fs.writeFileSync('firebase-config.js', content);
  console.log('firebase-config.js successfully generated from environment variables.');
} else {
  console.log('No FIREBASE_API_KEY environment variable found. Skipping config generation (assuming local environment).');
}
