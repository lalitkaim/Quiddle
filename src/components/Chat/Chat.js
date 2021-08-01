import React, { Component } from 'react'
import {IoMdArrowRoundBack} from 'react-icons/io'
import {IoMdSend} from 'react-icons/io'
import classes from './Chat.module.css'
import quiddle from '../../quiddle.svg'
import myPdf from '../../pdf.png'
import {AiOutlineLink} from 'react-icons/ai'
import { initialize } from '../config/Config'
import $ from 'jquery'
import imageCompression from 'browser-image-compression'

class Chat extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            name:'',
            token:null,
            imageUrl:'',
            inputVal:'',
            fileName: '',
            isOnline:false,
            chatArray:[]
        }
    }

    userId = null;
    tempChatArray = [];
    fileType="";

    goBackHandler(){
        window.location.href="/"
    }

    gotoImage(image){
        window.open(
            image,
            '_blank'
          );
    }

    inputHandler=(event)=>{
        this.setState({inputVal:event.target.value})
    }

    userProfileHandler=(event)=>{
        window.location.href="/userprofile?userId="+event.target.id
    }

    sendImageHandler=(event)=>{
        if(!event.target.files[0]){
            return
        }
        const myFilename = event.target.files[0].name
        const extension = myFilename.substr(myFilename.lastIndexOf(".")+1,myFilename.length)
        const db = initialize.firestore();
        const storage = initialize.storage();
        const uid = initialize.auth().currentUser.uid;
        let combinedDoc;
        if(uid<this.userId){
            combinedDoc=uid+""+this.userId
        }
        else{
            combinedDoc=this.userId+""+uid
        }
        const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }
        const time = new Date()
        const ref = storage.ref("chats/"+combinedDoc+"/"+time+"."+extension);

        if(event.target.files[0].type==="image/gif"){
            let uploadTask = ref.put(event.target.files[0])
            uploadTask.on('state_changed',function(snapshot){
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.getElementById("progressMainDiv").style.display="block";
                document.getElementById("progressBar").style.width=progress+"%";
            },function(err){
                alert(`Error : ${err}`)
            },()=>{
                storage.ref("chats/"+combinedDoc+"/"+time+"."+extension).getDownloadURL()
                .then(url=>{
                    this.setState({inputVal:url, fileName:myFilename}) 
                    this.fileType="image";
                    this.sendHandler();
                })
                .catch(err=>{
                    document.getElementById("progressMainDiv").style.display="none";
                    alert(`Error : ${err}`)
                })
            });
        }
        else if(event.target.files[0].type==="application/pdf"){
            let uploadTask = ref.put(event.target.files[0])
            uploadTask.on('state_changed',function(snapshot){
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.getElementById("progressMainDiv").style.display="block";
                document.getElementById("progressBar").style.width=progress+"%";
            },function(err){
                alert(`Error : ${err}`)
            },()=>{
                storage.ref("chats/"+combinedDoc+"/"+time+"."+extension).getDownloadURL()
                .then(url=>{
                    this.setState({inputVal:url, fileName:myFilename}) 
                    this.fileType="pdf";
                    this.sendHandler();
                })
                .catch(err=>{
                    document.getElementById("progressMainDiv").style.display="none";
                    alert(`Error : ${err}`)
                })
            });
        }
        else{
            imageCompression(event.target.files[0], options)
            .then(res=>{
                let uploadTask = ref.put(res)
                uploadTask.on('state_changed',function(snapshot){
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    document.getElementById("progressMainDiv").style.display="block";
                    document.getElementById("progressBar").style.width=progress+"%";
                },function(err){
                    alert(`Error : ${err}`)
                },()=>{
                    storage.ref("chats/"+combinedDoc+"/"+time+"."+extension).getDownloadURL()
                    .then(url=>{
                        this.setState({inputVal:url, fileName:myFilename}) 
                        this.fileType="image";
                        this.sendHandler();
                    })
                    .catch(err=>{
                        document.getElementById("progressMainDiv").style.display="none";
                        alert(`Error : ${err}`)
                    })
                });
            })
            .catch(err=>{
                alert("Please select either image or pdf.")
            })
        }
    }

    sendHandler=()=>{
        let myUrl="";
        if(this.state.inputVal.trim().length===0)
            return
        let combinedDoc;
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;

        db.doc("users/"+this.userId+"/friends/"+uid).get().then(res=>{
            let temp=res.data().pendingMsg+1
            db.doc("users/"+this.userId+"/friends/"+uid).set({
                pendingMsg:temp
            },{merge:true})
        })

        document.getElementById("inputElement").value=""
        if(uid<this.userId){
            combinedDoc=uid+""+this.userId
        }
        else{
            combinedDoc=this.userId+""+uid
        }
        var a  = document.createElement('a');
        a.href = this.state.inputVal;
        if(this.fileType.length===0)
            if(a.host && a.host != window.location.host){
                this.fileType="url" 
            }
        document.getElementById("inputElement").focus()
            db.collection("chats").doc(combinedDoc).get()
            .then(res=>{
                if(res.data()===undefined)
                    db.collection("chats").doc(combinedDoc).set({})
            })
            db.collection("chats/"+combinedDoc+"/messages").add({
                message : this.state.inputVal,
                sender : uid,
                fileType : this.fileType,
                fileName : this.state.fileName,
                receiver : this.userId,
                time : new Date()
            })
            .then(res=>{
                window.scrollTo(0,document.body.clientHeight)
                db.collection("chats/"+combinedDoc+"/messages/").doc(res.id).onSnapshot(doc=>{
                    db.doc("users/"+uid).get().then(res=>{
                        const senderName = res.data().name
                        this.sendMessageNotification(senderName, this.state.token, doc.data().sender);
                    })
                })
            })
            .catch(err=>{

            })
            this.setState({inputVal:'',fileName:''})
            this.fileType="";
            window.scrollTo(0,document.body.clientHeight)
            document.getElementById("inputElement").focus()
            document.getElementById("progressMainDiv").style.display="none";
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
            data: JSON.stringify({"to": FCMToken, "notification": {"title":senderName, "body":"Send you a message", "icon":"https://firebasestorage.googleapis.com/v0/b/the-quiddle.appspot.com/o/posts%2Ftst9AFrpXRV0JiigSPxPNXJaByb2%2Fd631d40b96?alt=media&token=e6641e71-80ee-4902-b465-05ac648f7721", "requireInteraction": "true", "click_action":"/chat?userId="+senderId}}),
            success : function(response) {
                
            },
            error : function(xhr, status, error) {
                console.log(xhr.error);                   
            }
        });
    }

    componentDidMount=()=>{
        const db = initialize.firestore();
        const storage = initialize.storage();
        const uid = initialize.auth().currentUser.uid;
        const database = initialize.database();
        let combinedDoc;

        database.ref("status/"+this.userId).on('value', (snapshot)=>{
            if(snapshot.val().isOnline){
                this.setState({isOnline:true})
            }
            else{
                this.setState({isOnline:false})
            }
        })

        db.collection("users").doc(this.userId).get()
        .then(res=>{
            this.setState({name:res.data().name, token:res.data().token})
            storage.ref("Profile_Cover/"+res.data().profileName).getDownloadURL()
            .then(url=>{
                this.setState({imageUrl:url})
            })
            .catch(err=>{
                console.log("Error: No profile pic was uploaded by user.")
                this.setState({imageUrl:quiddle})
            }) 
        })
        .catch(err=>{
            
        })

        if(uid<this.userId){
            combinedDoc=uid+""+this.userId
        }
        else{
            combinedDoc=this.userId+""+uid
        }
        let temp = 0;
        let final = new Date(2020,1,1);
        const monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const latestDate = new Date()

        db.collection("chats/"+combinedDoc+"/messages").orderBy("time").onSnapshot(docc=>{
            docc.docChanges().forEach((doc)=>{
                let myFinal;
                let myDate = new Date(doc.doc.data().time.seconds * 1000);
                if(myDate.getMonth()!==final.getMonth() || myDate.getDate()!==final.getDate() || myDate.getDate()!==final.getDate()){
                    final = myDate;
                    myFinal = <p className={classes.myFinal}>{monthArray[final.getMonth()]+" "+final.getDate()+", "+final.getFullYear()}</p>
                    if(final.getFullYear()===latestDate.getFullYear() && final.getMonth()===latestDate.getMonth() && final.getDate()===latestDate.getDate()){
                        myFinal = <p className={classes.myFinal}>Today</p>
                    }
    
                    if(final.getFullYear()===latestDate.getFullYear() && final.getMonth()===latestDate.getMonth() && final.getDate()===(latestDate.getDate()-1)){
                        myFinal = <p className={classes.myFinal}>Yesterday</p>
                    }
                }
                else{
                    myFinal = null
                }
                let minutes;
                if(myDate.getMinutes()<10){
                    minutes="0"+myDate.getMinutes();
                }
                else{
                    minutes=myDate.getMinutes();
                }
                const exactTime = myDate.getHours()+":"+minutes
                if(doc.doc.data().sender===uid){
                    if(doc.doc.data().fileType==="image"){
                        this.tempChatArray.push(<React.Fragment key={temp++}>{myFinal}<div className={classes.individualMainDiv}>
                            <div className={classes.rightChat}>
                                <div style={{border:"none"}}>
                                    <p><img onClick={()=>this.gotoImage(doc.doc.data().message)} src={doc.doc.data().message} alt="Chat Image."/><a href={doc.doc.data().message} target="_blank" className={classes.imgAnchor}><label className={classes.imgLabel}>{doc.doc.data().fileName}</label></a> <sub style={{color:"#656565"}} className={classes.subForTime}> at {exactTime}</sub></p>
                                </div>
                            </div>
                        </div></React.Fragment>)
                    }
                    else if(doc.doc.data().fileType==="pdf"){
                        this.tempChatArray.push(<React.Fragment key={temp++}>{myFinal}<div className={classes.individualMainDiv}>
                            <div className={classes.rightChat}>
                                <div style={{border:"none", width:"100%"}}>
                                    <div className={classes.myPdfDiv}>
                                        <img  src={myPdf}/>
                                        <a href={doc.doc.data().message} target="_blank">{doc.doc.data().fileName}</a>
                                        <p className={classes.docLabel}><sub style={{color:"#656565"}} className={classes.subForTime}> at {exactTime}</sub></p>
                                    </div>
                                </div>
                            </div>
                        </div></React.Fragment>)
                    }
                    else{
                        this.tempChatArray.push(<React.Fragment key={temp++}>{myFinal}<div className={classes.individualMainDiv}>
                            <div className={classes.rightChat}>
                                <div>  
                                    {
                                        doc.doc.data().fileType==="url" ? 
                                        <a href={doc.doc.data().message} target="_blank">{doc.doc.data().message}</a> :
                                        <p>{doc.doc.data().message} <sub style={{color:"#656565"}} className={classes.subForTime}> at {exactTime}</sub></p>
                                    }
                                </div>
                            </div>
                        </div></React.Fragment>)
                    }
                }
                else{
                    if(doc.doc.data().fileType==="image"){
                        this.tempChatArray.push(<React.Fragment key={temp++}>{myFinal}<div className={classes.individualMainDiv}>
                            <div className={classes.leftChat}>
                                <div style={{border:"none"}}>
                                    <p><img onClick={()=>this.gotoImage(doc.doc.data().message)} src={doc.doc.data().message} alt="Chat Image."/><a href={doc.doc.data().message} target="_blank" className={classes.imgAnchor}><label className={classes.imgLabel}>{doc.doc.data().fileName}</label></a>  <sub style={{color:"#5db9c5"}} className={classes.subForTime}> at {exactTime}</sub></p>
                                </div>
                            </div>
                        </div></React.Fragment>)
                    }
                    else if(doc.doc.data().fileType==="pdf"){
                        this.tempChatArray.push(<React.Fragment key={temp++}>{myFinal}<div className={classes.individualMainDiv}>
                            <div className={classes.leftChat}>
                                <div style={{border:"none", width:"100%"}}>
                                    <div className={classes.myPdfDiv}>
                                        <img  src={myPdf}/>
                                        <a href={doc.doc.data().message} target="_blank">{doc.doc.data().fileName}</a>  
                                        <p className={classes.docLabel}><sub style={{color:"#5db9c5"}} className={classes.subForTime}> at {exactTime}</sub></p>
                                    </div>
                                </div>
                            </div>
                        </div></React.Fragment>)
                    }
                    else{
                        this.tempChatArray.push(<React.Fragment key={temp++}>{myFinal}<div className={classes.individualMainDiv}>
                            <div className={classes.leftChat}>
                                <div>
                                    {
                                        doc.doc.data().fileType==="url" ? 
                                        <a href={doc.doc.data().message} target="_blank">{doc.doc.data().message}</a> :
                                        <p>{doc.doc.data().message} <sub style={{color:"#5db9c5"}} className={classes.subForTime}> at {exactTime}</sub></p>
                                    }
                                </div>
                            </div>
                        </div></React.Fragment>)
                    }
                }
            })
            this.setState({chatArray:[...this.tempChatArray]})
            window.scrollTo(0,document.body.clientHeight)
        })

        let typingTimer;                
        const doneTypingInterval = 1000; 
        const myInput = document.getElementById('inputElement');
        myInput.addEventListener('input', () => {
            clearTimeout(typingTimer);
            if (myInput.value) {
                db.doc("users/"+this.userId+"/friends/"+uid).set({
                    isTyping:true
                },{merge:true})
                .then(res=>{
                })
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
            }
        });
        const myTemp = this.userId
        function doneTyping () {
            db.doc("users/"+myTemp+"/friends/"+uid).set({
                isTyping:false
            },{merge:true})
            .then(res=>{
            })
        }

        db.doc("users/"+uid+"/friends/"+this.userId).onSnapshot(doc=>{
            if(doc.data().isTyping){
                if(this.state.isOnline){
                    document.getElementById("mySpan").innerText="Typing...";
                    document.getElementById("typingDiv").style.opacity="1"
                }
                else{
                    document.getElementById("mySpan").innerText="Typing...";
                    document.getElementById("typingDiv").style.opacity="0"
                }
            }
            else{
                database.ref("status/"+this.userId).on('value', (snapshot)=>{
                    if(snapshot.val().isOnline){
                        document.getElementById("mySpan").innerText="Online";
                        document.getElementById("typingDiv").style.opacity="1"
                    }
                    else{
                        setTimeout(() => {
                            this.lastOnline();
                        }, 5000);
                    }
                })
            }
        })

        database.ref("status/"+this.userId).on('value', (snapshot)=>{
            if(snapshot.val().isOnline){
                document.getElementById("mySpan").innerText="Online";
                document.getElementById("typingDiv").style.opacity="1"
            }
            else{
                setTimeout(() => {
                    this.lastOnline();
                }, 5000);
            }
        })
    }

        

    lastOnline=()=>{
        const database = initialize.database();
        database.ref("status/"+this.userId).once('value')
        .then(res=>{
            if(res.val().isOnline){
                return
            }
            let finalDate;
            const monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const date = new Date(res.val().last_changed);
            const currentDate = new Date();
            const dateDate = date.getDate()
            const dateMonth = date.getMonth()
            const dateYear = date.getFullYear()
            let minutes;
            if(date.getMinutes()<10){
                minutes="0"+date.getMinutes();
            }
            else{
                minutes=date.getMinutes();
            }
            if(dateYear===currentDate.getFullYear() && dateMonth===currentDate.getMonth() && dateDate===currentDate.getDate()){
                finalDate = "Last Online : Today at "+date.getHours()+":"+minutes;
            }
            else if(dateYear===currentDate.getFullYear() && dateMonth===currentDate.getMonth() && dateDate===(currentDate.getDate()-1)){
                finalDate = "Last Online : Yesterday at "+date.getHours()+":"+minutes;
            }
            else{
                finalDate = "Last Online : "+monthArray[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear()+" at "+date.getHours()+":"+minutes;
            }
            document.getElementById("mySpan").innerText=finalDate;
            document.getElementById("typingDiv").style.opacity="1"
        })
    }

    componentDidUpdate(){
        if(this.state.inputVal.length===0){
            const db = initialize.firestore();
            const uid = initialize.auth().currentUser.uid;
            db.doc("users/"+this.userId+"/friends/"+uid).set({
                isTyping:false
            },{merge:true})
            .then(res=>{
            })
        }
    }

    render() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.userId = urlParams.get('userId');
        const db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid
        
        db.doc("users/"+uid+"/friends/"+this.userId).set({
            pendingMsg:0
        },{merge:true})

        db.collection("users/"+uid+"/friends").where("status","==","friend").get().then(res=>{
            let temp=[]
            res.forEach(doc=>{
                temp.push(doc.id)
            })
            return temp
        })
        .then(res=>{
            if(!res.includes(this.userId)){
                window.location.href="/"
            }
        })

        return (
            <div>
                <img style={{display:"none"}} id="testingImg" src=""/>
                <header className={classes.header}>
                    <div>
                        <IoMdArrowRoundBack onClick={this.goBackHandler} size="35px"/>
                    </div>
                    <h4 style={{marginBottom:"9px"}}>{this.state.name}</h4>
                    <div className={classes.profilePic}> 
                        <div>
                            <img id={this.userId} onClick={this.userProfileHandler} src={this.state.imageUrl} alt="image"/>
                        </div>
                    </div>
                    <div className={classes.whenTyping} id="typingDiv">
                        <span id="mySpan">Typing...</span>
                    </div>
                </header>
                <div className={classes.chatMainDiv} id="focusChild">
                    {this.state.chatArray}                      
                </div>
                <footer className={classes.footer}>
                    <div className="input-group">
                        <div className={classes.imageSendDiv}>
                            <AiOutlineLink size="30px"/>
                            <input className={classes.imageSendInput} type="file" onChange={this.sendImageHandler}/>
                        </div>
                        <input type="text" onChange={this.inputHandler} value={this.state.inputVal} id="inputElement" className="form-control" placeholder="Type a message..."/>
                        <div onClick={this.sendHandler} className={"input-group-append "+classes.sendBtn}>
                            <span className="input-group-text"><IoMdSend size="25px" color="white"/></span>
                        </div>
                    </div>
                </footer>

                <div className={classes.progressMainDiv} id="progressMainDiv">
                    <div></div>
                    <div id="processTitle">Processing...</div>
                    <div className="progress">
                        <div className="progress-bar bg-info" id="progressBar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Chat
