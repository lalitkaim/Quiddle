import firebase from 'firebase'
import $ from 'jquery'

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

export const initialize = firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging();
const db = firebase.firestore();

let FCMToken = null

messaging.usePublicVapidKey("BFpCDDJz_3bPgL_yhcp7OD99lMdUTxsRalQd4V1BJnQQLC6zhSNkkZTaPD3vEoyUhT_xQ0gujqz2AyHLZkuBUPY")

messaging.requestPermission()
.then(function(){
})
.catch(function(err){
    console.log(err)
})

messaging.getToken()
.then(function(token){
    FCMToken = token
})
.catch(function(err){
    console.log(err)
})

messaging.onTokenRefresh(()=>{
messaging.getToken()
.then(function(token){
    FCMToken = token
})
.catch(function(err){
    console.log(err)
})
})

firebase.auth().onAuthStateChanged(user=>{
    const db = firebase.firestore();
    if(firebase.auth().currentUser){
        const uid = firebase.auth().currentUser.uid;
        db.collection("users").doc(uid).set({
            token: FCMToken
        }, { merge: true });
    }
})

messaging.onMessage(function(payload){
    if(payload.notification){
    let title = payload.notification.title
    let options ={
        body:payload.notification.body,
        click_action:payload.notification.click_action
    }
    const myNotification = new Notification(title, options)
}
})