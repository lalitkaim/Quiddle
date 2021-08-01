import React, { Component } from 'react'
import {IoMdArrowRoundBack} from 'react-icons/io'
import classes from '../profile/Profile.module.css'
import quiddle from '../../quiddle.svg'
import coverPicture from '../../cover.JPG'
import {GoLocation} from 'react-icons/go'
import {BsChatSquareDots} from 'react-icons/bs'
import {BsPlus} from 'react-icons/bs'
import {FaUserFriends} from 'react-icons/fa'
import {GiSecretBook} from 'react-icons/gi'
import { initialize } from '../config/Config'
import $ from 'jquery'


class Profile extends Component{

    constructor(props) {
        super(props)
    
        this.state = {
             imageUrls:[],
             username:null,
             userId:null,
             token:null,
             name:null,
             country:'',
             city:'',
             bio:'',
             temp:'',
             profileUrl:null,
             coverUrl:null,
        }
    }

    postOrder = []
    userId = null
    status = null
    myOwnHeight = "128px"

    componentDidMount(){
        let imageUrls = []
        let data = null

        const storage = initialize.storage();
        const db = initialize.firestore();
        
        let ref = storage.ref("posts/"+this.userId);
        db.collection("users/"+this.userId+"/posts").orderBy("date","desc").get().then(snapshot=>{
            snapshot.forEach((doc)=>{
                this.postOrder.push(doc.data().image)
            })
            return this.postOrder;
        })
        .then(ress =>{
            ref.listAll().then((res)=>{
                res.items.forEach((itemRef)=>{
                    for(let i=0;i<ress.length;i++){
                        if(ress[i]===itemRef.name){
                            itemRef.getDownloadURL().then((url)=>{
                                imageUrls[i]=url;
                                this.setState({imageUrls:imageUrls})
                            })
                            .catch(err=>{
            
                            })
                        }
                    }
                })
            })
            .catch(function(err){
                console.log("error",err)
            })
        })
        .catch(err=>{
            
        }) 
        db.collection("users").doc(this.userId).get().then((doc)=>{
            data =  doc.data()
            this.setState({username:data.username,name:data.name, userId:data.userId, country:data.country, city:data.city, bio:data.bio, token:data.token})
        })
        .catch(err=>{
            
        })
        db.doc("users/"+this.userId).get().then(res=>{
            storage.ref("Profile_Cover/"+res.data().profileName).getDownloadURL().then(url=>{
                this.setState({profileUrl:url})
            }).catch(err=>console.log("Error: Please Upload Profile/Cover"))
            storage.ref("Profile_Cover/"+res.data().coverName).getDownloadURL().then(url=>{
                this.setState({coverUrl:url})
            }).catch(err => console.log("Error: Please Upload Profile/Cover"))
        })
        .catch(err=>{
            console.log("Error : ",err)
        })

        this.myOwnHeight = (document.getElementById("topSecret").offsetWidth-9)/3+"px"
    }

    showPostHandler=(event)=>{
        window.location.href="/showpost?id="+event.target.id+"&userId="+this.state.userId
    }

    friendRequestHandler=()=>{
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;
        db.collection("users/"+uid+"/friends").doc(this.userId).set({favourite:false,status:"sent",userId:this.userId})
        db.collection("users/"+this.userId+"/friends").doc(uid).set({favourite:false,status:"received",userId:uid})
        db.doc("users/"+uid).get()
        .then(res=> {
            return res.data().name
        })
        .then(senderName=>{
            let temp = null
            db.collection("users/"+this.userId+"/notifications/").add({
                senderId : uid,
                senderName : senderName,
                time : new Date(),
                type : "RequestReceive"
            })
            .then(res=>{
                db.collection("users/"+this.userId+"/notifications/").doc(res.id).onSnapshot(doc=>{
                    db.doc("users/"+uid).get().then(ress=>{
                        const senderName = ress.data().name
                        this.sendMessageNotification(senderName, this.state.token, doc.data().senderId);
                    })
                })
            })
            .catch(err=>{
                console.log("Error: ", err)
            })
        })
    }

    sendMessageNotification=(senderName, FCMToken, senderId)=>{
        $.ajax({        
            type : 'POST',
            url : "https://fcm.googleapis.com/fcm/send",
            headers : {
                Authorization : 'key=' + 'AAAAgQHubVs:APA91bGu4mYyVJXQDWUfALhqrLYwBrehvhfyR20y9_R4BYM06pIO0uCkvwDzTqhDOEUFFTiJidfLQJ36M2FymLaLsKpGP6cqa7E6YNpKLRm56pk35YyqEW-MC-PjKfcATPbt2JWSWNuH'
            },
            contentType : 'application/json',
            dataType: 'json',
            data: JSON.stringify({"to": FCMToken, "notification": {"title":senderName, "body":"Send you a friend request", "icon":"https://firebasestorage.googleapis.com/v0/b/the-quiddle.appspot.com/o/posts%2Ftst9AFrpXRV0JiigSPxPNXJaByb2%2Fd631d40b96?alt=media&token=e6641e71-80ee-4902-b465-05ac648f7721", "requireInteraction": "true", "click_action":"/userprofile?userId="+senderId}}),
            success : function(response) {
                window.location.reload();
            },
            error : function(xhr, status, error) {
                console.log(xhr.error);  
                window.location.reload();
            }
        });
    }

    acceptHandler=()=>{
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;
        db.collection("users/"+uid+"/friends").doc(this.userId).set({favourite:false,status:"friend",userId:this.userId})
        db.collection("users/"+this.userId+"/friends").doc(uid).set({favourite:false,status:"friend",userId:uid})
        db.collection("users/"+uid+"/notifications/").where("senderId","==",this.userId).get().then(res=>{
            res.forEach(doc=>{
                db.doc("users/"+uid+"/notifications/"+doc.id).delete().then(ress=>{
                    window.location.reload();
                })
            })
        })
    }

    removeFriendHandler=()=>{
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;
        db.collection("users/"+uid+"/friends").doc(this.userId).delete().then(res=>{
            db.collection("users/"+this.userId+"/friends").doc(uid).delete().then(res=>{
                window.location.reload();
            })
        })
    }

    goBackHandler(){
        window.location.href="/profile"
    }

    chatHandler=()=>{
        window.location.href="/chat?userId="+this.userId
    }

    render(){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.userId = urlParams.get('userId');

        if(this.userId===initialize.auth().currentUser.uid){
            window.location.href="/profile"
        }

        const db = initialize.firestore()
        db.collection("users/"+initialize.auth().currentUser.uid+"/friends").where("userId","==",this.userId).get()
        .then(res=>{
            res.forEach(doc=>{
                this.status=doc.data().status
            })
        }).catch(err=>{
            
        })

        let imageList = []
        let profile = null
        let bio = null;
        let cover = null
        let letsChat = null;
        let requestSender = null;
        let temp = 0;

        if(this.state.imageUrls.length>0 && this.status==="friend"){
            for(let i=this.state.imageUrls.length-1;i>=0;i--){
                imageList[i]=<div key={i} className="col-4" style={{height:this.myOwnHeight}} id={this.postOrder[i]} onClick={this.showPostHandler}><img id={this.postOrder[i]} className="img-fluid" src={this.state.imageUrls[i]} alt=""/></div>
            }
        }
        else{
            if(this.status==="friend"){
                imageList[0]=<h4 key={temp++} style={{textAlign:"center", width:"100%", marginTop:"20px"}}>Nothing posted by <b style={{color:"#ffad60"}}>{this.state.name}</b></h4>
            }
            else{
                imageList[0]=<h4 key={temp++} style={{textAlign:"center", width:"100%", marginTop:"20px"}}>Sorry! only friends can see <b style={{color:"#ffad60"}}>{this.state.name}</b> post.</h4>
            }
        }

        switch(this.status){
            case "friend":
                bio=<p><GiSecretBook/> {this.state.bio}</p>
                letsChat = <button style={{margin:"auto"}} className={classes.messageBtn}><BsChatSquareDots onClick={this.chatHandler} size="30px" color="#ffad60"/></button>
                requestSender = <button className={"btn "+classes.friendsBtn} 
                                        data-toggle="modal" data-target="#removeFriend"
                                        style={{backgroundColor: "#ffad60",color: "white",margin: "3px 0 5px",padding: "0 15px",lineHeight: "30px",borderRadius: "0",fontSize: "16px"}}>
                                        FRIENDS
                                </button>
                break;
            case "sent":
                requestSender=<button className="btn btn-warning" style={{padding: "0 15px",lineHeight: "30px",borderRadius: "0",fontSize: "16px"}}>SENT</button>
                bio = <p>Sorry! only friends can see <b style={{color:"#ffad60"}}>{this.state.name}</b> Bio.</p>
                break;
            case "received":
                requestSender = <button  className={"btn "+classes.acceptButton} onClick={this.acceptHandler}>ACCEPT</button>
                bio = <p>Sorry! only friends can see <b style={{color:"#ffad60"}}>{this.state.name}</b> Bio.</p>
                break;
            default:
                bio = <p>Sorry! only friends can see <b style={{color:"#ffad60"}}>{this.state.name}</b> Bio.</p>
                requestSender = <button data-toggle="modal" data-target="#addFriendAs" className={classes.addFriend}><BsPlus size="35px"/></button>
                break;
        }

        if(this.state.profileUrl){
            profile = <img className="img-fluid" src={this.state.profileUrl} alt="image"/>
        }
        else{
            profile =  <img className="img-fluid" src={quiddle} alt="image"/>
        }
        if(this.state.coverUrl){
            cover = <img className="img-fluid" src={this.state.coverUrl} alt="image"/>
        }
        else{
            cover =  <img className="img-fluid" src={coverPicture} alt="image"/>
        }

        return (
            <div className={classes.profileMain}>
                <header className={classes.header}>
                    <div>
                        <a onClick={this.goBackHandler}><IoMdArrowRoundBack size="30px" color="black"/></a>
                        <h5>{this.state.username}</h5>
                    </div>
                </header>
                <div className={classes.cover_picture_div}>
                    {cover}
                </div>
                <div className={classes.profile_picture_main}>
                    <div className={classes.profile_picture}>
                        <div style={{backgroundColor:"white"}}>
                            {profile}
                        </div>                    
                        <div>
                            <h6>{this.state.name}</h6>
                            <p><GoLocation size="20px"/>{this.state.country+", "+this.state.city}</p>
                        </div>
                    </div>
                    <div>
                        {letsChat}  
                        {requestSender}
                    </div>

{/* modal start for add friend */}

                    <div className="modal fade" id="addFriendAs" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className={"modal-dialog "+classes.modalMainDiv} role="document">
                            <div className="modal-content">
                                <div className={"modal-body "+classes.friendAsDiv} data-dismiss="modal">
                                    <h4>Confirmation</h4>
                                    <p>Want to add new friend?</p>
                                    <div className={classes.requestModalDiv}>
                                        <button className="btn" style={{backgroundColor:"#ffad60"}} onClick={this.friendRequestHandler}><FaUserFriends/> SEND</button>
                                        <button className="btn" style={{backgroundColor:"#17a2b8"}} data-dismiss="modal">CANCEL</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

{/* modal end for add friend */}

                    <div className="modal fade" id="removeFriend" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className={"modal-dialog "+classes.modalMainDiv} role="document">
                            <div className="modal-content">
                                <div className={"modal-body "+classes.friendAsDiv} data-dismiss="modal">
                                    <h4>Confirmation</h4>
                                    <p>Want to remove your friend?</p>
                                    <div className={classes.requestModalDiv}>
                                        <button className="btn" style={{backgroundColor:"#f0506e"}} onClick={this.removeFriendHandler}><FaUserFriends/> REMOVE</button>
                                        <button className="btn" style={{backgroundColor:"#17a2b8"}} data-dismiss="modal">CANCEL</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                <div className={classes.about}>
                    {bio}
                </div>
                <div className={"container "+classes.postMain}>
                    <div className="row" id="topSecret">
                        {imageList}
                    </div>
                </div>
            </div>
        )
    }
}

export default Profile
