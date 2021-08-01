import React, { Component } from 'react'
import { initialize } from '../config/Config'
import {IoMdArrowRoundBack} from 'react-icons/io'
import {MdDelete} from 'react-icons/md'
import classes from './Notification.module.css'
import quiddle from '../../quiddle.svg'

class Notification extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            notificationList:[],
            notiPrifilePicList:[]
        }
    }

    notiPrifilePicList=[]
    senderNameList=[]
    requestAsList=[]
    senderIdList=[]
    docIdList=[]
    
    componentDidMount=()=>{
        const uid = initialize.auth().currentUser.uid
        const db = initialize.firestore();
        const storage = initialize.storage();
        const ref = storage.ref("Profile_Cover");
        db.collection("users/"+uid+"/notifications").orderBy("time").onSnapshot(docc=>{
            docc.docChanges().forEach((doc, index)=>{
                if(doc.doc.data().type==="RequestReceive"){

                    this.senderNameList[index]=doc.doc.data().senderName
                    this.requestAsList[index]=doc.doc.data().requestAs
                    this.senderIdList[index]=doc.doc.data().senderId
                    this.docIdList[index]=doc.doc.id

                    ref.listAll().then((res)=>{
                        res.items.forEach((itemRef)=>{
                            if("profile"+doc.doc.data().senderId===itemRef.name.substr(0, itemRef.name.lastIndexOf("."))){
                                itemRef.getDownloadURL().then((url)=>{
                                    this.notiPrifilePicList[index]=url;
                                    this.setState({notiPrifilePicList:[...this.notiPrifilePicList]})
                                })
                                .catch(err=>{
                
                                })
                            }
                        })
                    })
                    .catch(function(err){
                        console.log("error",err)
                    })
                    
                }
            })  
        })
    }

    onRejectHandler=(event)=>{
        const userId = event.target.id
        const docId = event.target.getAttribute("data-doc-id")
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;
        db.collection("users/"+uid+"/friends").doc(userId).delete().then(res=>{
            db.collection("users/"+userId+"/friends").doc(uid).delete().then(res=>{
                db.doc("users/"+uid+"/notifications/"+docId).delete().then(res=>{
                    window.location.reload();
                })
            })
        })
    }

    onAcceptHandler=(event)=>{
        const userId = event.target.id
        const docId = event.target.getAttribute("data-doc-id")
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;
        db.collection("users/"+uid+"/friends").doc(userId).set({favourite:false,status:"friend",userId:userId}).then(res=>{
            db.collection("users/"+userId+"/friends").doc(uid).set({favourite:false,status:"friend",userId:uid}).then(res=>{
                db.doc("users/"+uid+"/notifications/"+docId).delete().then(res=>{
                    window.location.reload();
                })
            })
        })  
        
    }

    goBackHandler(){
        window.location.href="/"
    }

    goToProfileHandler(event){
        window.location.href="/userprofile?userId="+event.target.id
    }

    render() {

        let myNotifications=[]
            myNotifications = this.senderNameList.map((res,index)=>
            this.notiPrifilePicList[index]  ?
            (<div key={index} className={classes.notificationDiv}>
                <div className={classes.notiUpperDiv}>
                    <div>
                        <img src={this.notiPrifilePicList[index]}/>
                    </div>
                    <div>
                        <h5 id={this.senderIdList[index]} onClick={this.goToProfileHandler}>{res}</h5>
                        <p>Send you a request as a <b>{this.requestAsList[index]}</b>.</p>
                    </div>
                </div>
                <div className={classes.notiDownDiv}>
                    <button className={"uk-button uk-button-danger "+classes.rejectBtn} id={this.senderIdList[index]} data-doc-id={this.docIdList[index]} onClick={this.onRejectHandler}>REJECT</button>
                    <button className={"btn btn-info "+classes.acceptBtn} id={this.senderIdList[index]} data-doc-id={this.docIdList[index]} onClick={this.onAcceptHandler}>ACCEPT</button>
                </div>
            </div>) :
            (<div key={index} className={classes.notificationDiv}>
                <div className={classes.notiUpperDiv}>
                    <div>
                        <img src={quiddle}/>
                    </div>
                    <div>
                        <h5 id={this.senderIdList[index]} onClick={this.goToProfileHandler}>{res}</h5>
                        <p>Send you a request as a <b>{this.requestAsList[index]}</b>.</p>
                    </div>
                </div>
                <div className={classes.notiDownDiv}>
                    <button className={"uk-button "+classes.rejectBtn} id={this.senderIdList[index]} data-doc-id={this.docIdList[index]} onClick={this.onRejectHandler}>REJECT</button>
                    <button className={"btn "+classes.acceptBtn} id={this.senderIdList[index]} data-doc-id={this.docIdList[index]} onClick={this.onAcceptHandler}>ACCEPT</button>
                </div>
            </div>)
        )
        
        return (
            <div>
                <header className={classes.header}>
                <h5><a onClick={this.goBackHandler}><IoMdArrowRoundBack color="black" size="30px"/></a>Notifications</h5>
                </header>
                <div>
                    {
                        myNotifications.length ? 
                        myNotifications : 
                        <div className={classes.emptyDiv}>
                            <MdDelete color="#ccc" size="200px"/>
                            <h1 style={{color:"#ccc"}}>Empty</h1>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default Notification
