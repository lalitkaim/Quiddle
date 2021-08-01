import React, { Component } from 'react'
import {IoMdArrowRoundBack} from 'react-icons/io'
import quiddle from '../../quiddle.svg'
import classes from './ShowPost.module.css'
import {AiOutlineLike, AiFillLike, AiOutlinePicture, AiOutlineDelete} from 'react-icons/ai'
import {BsThreeDotsVertical, BsPencilSquare} from 'react-icons/bs'
import {MdClose} from 'react-icons/md'
import { initialize } from '../config/Config'
import $ from 'jquery'

class ShowPost extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             profileUrl:null,
             postUrl:null,
             name:'',
             country:'',
             city:'',
             title:'',
             token:'',
             likes:null,
             likesArray:[],
             titleVal:'',
             likeListPic:[]
        }
    }
    

    username = null;
    userId = null;
    afterBeforeLike = null;
    postDocId = null
    likeList=[]

    componentDidMount(){
        let temp=[];
        let storage = initialize.storage();
        let  db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid
        let postRef = storage.ref("posts/"+this.userId+"/"+this.username);
        db.doc("users/"+this.userId).get().then(res=>{
            this.setState({name:res.data().name, country:res.data().country, city:res.data().city, token:res.data().token})
            const profileRef = storage.ref("Profile_Cover/"+res.data().profileName)
            profileRef.getDownloadURL().then(url=>{
                this.setState({profileUrl:url})
            })
            .catch(err=>{
                this.setState({profileUrl:quiddle})
            })
        })
        
        postRef.getDownloadURL().then(url=>{
            this.setState({postUrl:url})
        })
        .catch(err=>{
            
        })

        db.collection("users/"+this.userId+"/posts").where("image","==", this.username).get()
        .then(snapshot=>{
            snapshot.forEach((doc)=>{
                this.setState({title:doc.data().title, likes:doc.data().likes.length, likesArray:doc.data().likes})
            })
        })
        .catch(err=>{
            
        })

        let tempLikesArray = []
        let docId;
        db.collection("users/"+this.userId+"/posts").where("image","==", this.username).get()
        .then(res=>{
            res.forEach(doc=>{
                docId = doc.id
            })
            return docId
        })
        .then(docc=>{
            if(docc){
                db.collection("users/"+this.userId+"/posts").doc(docc).get()
                .then(res=>{
                    tempLikesArray=res.data().likes
                    if(tempLikesArray.includes(initialize.auth().currentUser.uid)){
                        this.afterBeforeLike = <span><AiFillLike size="25px" onClick={this.removeLikeHandler}/> Likes <span style={{fontWeight:"bold"}}>{this.state.likes}</span></span>
                        this.forceUpdate()
                    }
                    else{
                        this.afterBeforeLike = <span><AiOutlineLike size="25px" onClick={this.addLikeHandler}/> Likes <span style={{fontWeight:"bold"}}>{this.state.likes}</span></span>            
                        this.forceUpdate()
                    }
                    return tempLikesArray
                })
                .then(docc=>{
                    docc.forEach(res=>{
                        db.doc("users/"+res).get().then(ress=>{
                            storage.ref("Profile_Cover/"+ress.data().profileName).getDownloadURL()
                            .then(url=>{
                                temp.push(url)
                                this.likeList.push(<li key={res}><img src={url}/></li>);
                                this.setState({likeListPic:[...temp]})
                            })
                            .catch(err=>{
                                console.log("Error : ",err)
                            })
                        })
                        .catch(err=>{
                            console.log("Error : ",err)
                        })
                    })
                })
                .catch(err=>{
            
                })  
            }
            return tempLikesArray
        })

        db.collection("users/"+this.userId+"/posts/").where("image","==",this.username).get()
        .then(res=>{
            res.forEach(doc=>{
                this.postDocId = doc.id
                this.setState({titleVal:doc.data().title})
            })
        })

        // document.getElementById("postImage").style.height=window.innerWidth+"px"
    }

    componentDidUpdate=()=>{
        let tempLikesArray = []
        let docId;
        let  db = initialize.firestore();
        db.collection("users/"+this.userId+"/posts").where("image","==", this.username).get()
        .then(res=>{
            res.forEach(doc=>{
                docId = doc.id
            })
            return docId
        })
        .then(docc=>{
            if(docc){
                db.collection("users/"+this.userId+"/posts").doc(docc).get()
                .then(res=>{
                    tempLikesArray=res.data().likes
                    if(tempLikesArray.includes(initialize.auth().currentUser.uid)){
                        this.afterBeforeLike = <span><AiFillLike size="25px" onClick={this.removeLikeHandler}/> Likes <span style={{fontWeight:"bold"}}>{this.state.likes}</span></span>
                    }
                    else{
                        this.afterBeforeLike = <span><AiOutlineLike size="25px" onClick={this.addLikeHandler}/> Likes <span style={{fontWeight:"bold"}}>{this.state.likes}</span></span>            
                    }
                })
                .catch(err=>{
            
                })
            }
        })
        .catch(err=>{
            
        })
    }

    addLikeHandler=()=>{
        const uid = initialize.auth().currentUser.uid
        let likesSet = new Set(this.state.likesArray)
        likesSet.add(uid)
        this.setState({likes:Array.from(likesSet).length})
        let db = initialize.firestore();
        let docId;
        db.collection("users/"+this.userId+"/posts").where("image","==", this.username).get()
        .then(res=>{
            res.forEach(doc=>{
                docId = doc.id
            })
            return docId
        })
        .then(docc=>{
            if(docc){
                db.collection("users/"+this.userId+"/posts").doc(docc).update({
                    likes: [...likesSet]
                })
                .then(res=>{
                    db.doc("users/"+uid).get().then(doc=>{
                        this.sendMessageNotification(doc.data().name, this.state.token, this.userId, this.username);
                    })
                    setTimeout(() => {
                        this.forceUpdate();
                    }, 1000);
                })
                
            }
        })
        .catch(err=>{
            
        })
    }

    sendMessageNotification=(senderName, FCMToken, posterId, imageId)=>{
        $.ajax({        
            type : 'POST',
            url : "https://fcm.googleapis.com/fcm/send",
            headers : {
                Authorization : 'key=' + 'AAAAgQHubVs:APA91bGu4mYyVJXQDWUfALhqrLYwBrehvhfyR20y9_R4BYM06pIO0uCkvwDzTqhDOEUFFTiJidfLQJ36M2FymLaLsKpGP6cqa7E6YNpKLRm56pk35YyqEW-MC-PjKfcATPbt2JWSWNuH'
            },
            contentType : 'application/json',
            dataType: 'json',
            data: JSON.stringify({"to": FCMToken, "notification": {"title":senderName, "body":"likes your post.", "icon":this.state.postUrl, "requireInteraction": "true", "click_action":"/showpost?id="+imageId+"&userId="+posterId}}),
            success : function(response) {

            },
            error : function(xhr, status, error) {
                console.log(xhr.error);                   
            }
        });
    }

    removeLikeHandler=()=>{
        let likesSet = new Set(this.state.likesArray)
        likesSet.delete(initialize.auth().currentUser.uid)
        this.setState({likes:Array.from(likesSet).length})
        let db = initialize.firestore();
        let docId;
        db.collection("users/"+this.userId+"/posts").where("image","==", this.username).get()
        .then(res=>{
            res.forEach(doc=>{
                docId = doc.id
            })
            return docId
        })
        .then(docc=>{
            if(docc){
                db.collection("users/"+this.userId+"/posts").doc(docc).update({
                    likes: [...likesSet]
                })
                setTimeout(() => {
                    this.forceUpdate();
                }, 1000);
            }
        })
        .catch(err=>{
            
        })
    }

    goBackHandler=()=>{
        if(initialize.auth().currentUser.uid===this.userId)
            window.location.href="/profile?userId="+this.userId
        else{
            window.location.href="/userprofile?userId="+this.userId
        }
    }

    settingOpenHandler(){
        document.getElementById('settingDiv').style.transform="translateX(0px)"
    }
    settingCloseHandler(){
        document.getElementById('settingDiv').style.transform="translateX(260px)"
    }

    changeInputHandler=(event)=>{
        this.setState({titleVal:event.target.value})
    }
    changeTitleHandler=()=>{
        const db = initialize.firestore();
        db.collection("users/"+this.userId+"/posts/").doc(this.postDocId).set({
            title: this.state.titleVal
        }, { merge: true })
        .then(res=>{
            window.location.reload()
        })
    }

    updatePostHandler=(event)=>{
        const db = initialize.firestore();
        const storage = initialize.storage();
        storage.ref("posts/"+this.userId+"/"+this.username).put(event.target.files[0])
        .on("state_changed",function(snapshot){
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById("progressMainDiv").style.display="block";
            document.getElementById("progressBar").style.width=progress+"%";
        }, function(err){
            console.log("Error : ", err)
        }, function(){
            alert("Picture Updated Successfully.")
            window.location.reload()
        })
    }

    postDeleteConfirm=()=>{
        const db = initialize.firestore();
        const storage = initialize.storage();
        storage.ref("posts/"+this.userId+"/"+this.username).delete().then(res=>{})
        db.collection("users/"+this.userId+"/posts").where("image","==",this.username).get()
        .then(res=>{
            res.forEach(doc=>{
                db.doc("users/"+this.userId+"/posts/"+doc.id).delete().then(res=>{ 
                    alert("Post Deleted Successfully.")
                    window.location.href="/profile"
                 })
            })
        })
    }
    
    postUserHandler=()=>{
        window.location.href="/userprofile?userId="+this.userId
    }

    goToImageUrlHandler=()=>{
        window.location.href=this.state.postUrl
    }
    render() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.username = urlParams.get('id');
        this.userId = urlParams.get('userId');
        const uid = initialize.auth().currentUser.uid;
        const db = initialize.firestore();
        
        db.collection("users/"+uid+"/friends").where("status","==","friend").get().then(res=>{
            let temp=[]
            res.forEach(doc=>{
                temp.push(doc.id)
            })
            return temp
        })
        .then(res=>{
            if(!res.includes(this.userId) && this.userId!==uid){
                window.location.href="/"
            }
        })

        return (
            <div className={classes.showPostMainDiv}>
                <header className={classes.header}>
                    <IoMdArrowRoundBack size="30px" onClick={this.goBackHandler}/>
                    {uid===this.userId ? 
                        <React.Fragment><BsThreeDotsVertical size="25px" onClick={this.settingOpenHandler}/>
                        <div className={classes.settingDiv} id="settingDiv">
                            <div>
                                <a style={{textAlign:"right"}} onClick={this.settingCloseHandler} ><MdClose size="25px"/></a>
                            </div>
                            <div>
                                <a data-target="#updateTitle" data-toggle="modal" ><BsPencilSquare size="20px"/> Update Post Title</a>
                            </div>
                            <div>
                                <a data-target="#updatePicture" data-toggle="modal" ><AiOutlinePicture size="22px"/> Update Picture</a>
                            </div>
                            <div>
                                <a data-target="#deletePost" data-toggle="modal" ><AiOutlineDelete size="22px"/> Delete Post</a>
                            </div>
                        </div>
                        </React.Fragment> :
                    null}
                </header>
                <div className={classes.postContainer}>
                    <div className={classes.postHeader}>
                        <div>
                            <img onClick={this.postUserHandler} src={this.state.profileUrl}/>
                        </div>
                        <div>
                            <h5 onClick={this.postUserHandler}>{this.state.name}</h5>
                            <p>{this.state.country+", "+this.state.city}</p>
                        </div>
                    </div>
                    <div>
                        <p>{this.state.title}</p>
                    </div>
                    <div id="postImage" className={classes.postImageDiv}>
                        <img onClick={this.goToImageUrlHandler} className={classes.postImage} src={this.state.postUrl}/>
                    </div>
                    <div className={classes.postFooter}>
                        <div className={"uk-position-relative uk-visible-toggle uk-light "+classes.likePeoples} tabIndex="-1" uk-slider="sets:false; finite:true">
                            <ul className="uk-slider-items">
                                {this.likeList}
                            </ul>
                        </div>
                        {this.afterBeforeLike}
                    </div>
                </div>

{/* modals start for post options */}
                
                <div className="modal fade" id="updateTitle" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.modalDialog}>
                        <div className="modal-content">
                            <div className="modal-body">
                                <h5>Change Title</h5>
                                <textarea className="form-control" value={this.state.titleVal} onChange={this.changeInputHandler}></textarea>
                                <button onClick={this.changeTitleHandler} className="btn" style={{float:"right",backgroundColor: "rgb(255, 173, 96)", color: "white", margin:"5px 0px 0px", padding:"0px 15px", lineHeight: "30px", borderRadius: "0px", fontSize: "16px"}}>UPDATE</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="updatePicture" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.modalDialog}>
                        <div className="modal-content">
                            <div className="modal-body">
                                <h5>Upload New Picture</h5>
                                <div style={{position:"relative"}}>
                                    <label className={classes.uploadFileLabel}>Choose Picture...</label>
                                    <input onChange={this.updatePostHandler} className={classes.postUploadInput} type="file" />
                                </div>
                                <div className={classes.progressMainDiv} id="progressMainDiv">
                                    <div></div>
                                    <div id="processTitle">Processing...</div>
                                    <div className="progress">
                                        <div className="progress-bar bg-info" id="progressBar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="deletePost" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.modalDialog}>
                        <div className="modal-content">
                            <div className="modal-body">
                                <h4>Confirmation</h4>
                                <p>Do you really want to delete the post?</p>
                                <div className={classes.deletePostModalDiv}>
                                    <button className="btn" style={{backgroundColor:"#f0506e"}} onClick={this.postDeleteConfirm}>DELETE</button>
                                    <button className="btn" style={{backgroundColor:"#17a2b8"}} data-dismiss="modal">CANCEL</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

{/* modals end for post options */}
            </div>
        )
    }
}

export default ShowPost
