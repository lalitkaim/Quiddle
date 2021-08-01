// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// admin.initializeApp();
// const firestore = admin.firestore();

//   exports.onOffOn = functions.database.ref('/status/{uid}').onUpdate(
//     async (change, context) => {
//       const eventStatus = change.after.val();
//       const userStatusFirestoreRef = firestore.doc("users/"+context.params.uid);
//       const statusSnapshot = await change.after.ref.once('value');
//       const status = statusSnapshot.val();
//       console.log(status, eventStatus);
//       console.log("hello")
//       if (status.last_changed > eventStatus.last_changed) {
//         return null;
//       }
//       console.log("hi")
//       eventStatus.last_changed = new Date(eventStatus.last_changed);
//       return userStatusFirestoreRef.set(eventStatus, { merge: true });
//   });

//   exports.onRequestReceive =  functions.firestore.document('users/{userId}/friends/{doc}')
//     .onCreate(async (snap, context)=>{   
//       if(snap.data().status==="received"){
//         let token;
//         try{
//           const res = await firestore.collection("users").doc(context.params.userId).get()
//           console.log(res.data().token)
//           token = res.data().token

//         }
//         catch(err){
//           console.log("error", err)
//         }
//         var message={
//           notification:{
//             title:"Hi",
//             body:"Your DB just Updated"
//           },
//           token:token
//         };
//         admin.messaging().send(message)
//         .then(ress=>{
//           console.log("lklk",ress)
//           return ress
//         })
//         .catch(err=>{
//           console.log("error", err)
//         })
//       } 
//       return null
//   })
