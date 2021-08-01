importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyD1cXY_0AIVMWjZmRxP-0Y0JikLOO_l1rs",
    authDomain: "the-quiddle.firebaseapp.com",
    databaseURL: "https://the-quiddle.firebaseio.com",
    projectId: "the-quiddle",
    storageBucket: "the-quiddle.appspot.com",
    messagingSenderId: "554083183963",
    appId: "1:554083183963:web:4597dbd866208279533e7e",
    measurementId: "G-KNSLJB7XMF"
};

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    const notificationTitle ="Quiddle";
    const notificationOptions = {
        body: payload.notification.body
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});