import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence,
  getAuth
} from "firebase/auth";
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9Hu9BpXbiLtHDiPnw7LR4F9NPUY3wTmA",
  authDomain: "litlover-7c610.firebaseapp.com",
  projectId: "litlover-7c610",
  storageBucket: "litlover-7c610.appspot.com", // Исправлено с .appspot.app на .appspot.com
  messagingSenderId: "647148914810",
  appId: "1:647148914810:web:75c21f9a179a70617413c3",
  measurementId: "G-V7HCD3836X"
};

let auth, app;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Инициализация Auth
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);
console.log(db);
// const db = initializeFirestore(app, {
//     localCache: persistentLocalCache(),
//     experimentalForceLongPolling: true // Важно для React Native
//   });

export { auth, app, db};

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { initializeApp } from "firebase/app";
// import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
// import { getApps } from "firebase/app";
// import { getFirestore, initializeFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyA9Hu9BpXbiLtHDiPnw7LR4F9NPUY3wTmA",
//   authDomain: "litlover-7c610.firebaseapp.com",
//   projectId: "litlover-7c610",
//   storageBucket: "litlover-7c610.appspot.app",
//   messagingSenderId: "647148914810",
//   appId: "1:647148914810:web:75c21f9a179a70617413c3",
//   measurementId: "G-V7HCD3836X"
// };

// // Initialize Firebase
// let app, auth, db;

// if (!getApps().length) {
//   try {
//     app = initializeApp(firebaseConfig);
//     auth = initializeAuth(app, {
//       persistence: getReactNativePersistence(AsyncStorage),
//     });
//     db = initializeFirestore(app, {
//       experimentalForceLongPolling: true, // Решение для некоторых проблем с подключением
//     });
//     console.log("Yes");
//   } catch (error) {
//     console.log("Error initializing app: " + error);
//   }
// } else {
//   app = getApp();
//   auth = getAuth(app);
//   db = getFirestore(app);
//   console.log("This is errorELSE")
// }

// export { auth, app, db };
