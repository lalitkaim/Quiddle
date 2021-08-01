import React, { Component } from 'react'
import classes from './Message.module.css'
import quiddle from '../../quiddle.svg'
import {AiFillStar, AiOutlineStar} from 'react-icons/ai'
import {IoIosNotifications} from 'react-icons/io'
import {BsPeopleCircle, BsCircleFill} from 'react-icons/bs'
import {GoSearch} from 'react-icons/go'
import { initialize } from '../config/Config'

class Message extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            onlineFriends:[],
            onlineProfilePicList:[],
            allFriends:[],
            allFriendsName:[],
            allFriendsProfilePic:[],
            allFavourite:[],
            notificationCount:0,
            pendingMsgCount:[],
            allFriendsLastChat:[]
        }
    }
    
    onlineProfilePicList=[]
    allFriendsProfile=[]
    allFriendsLastChat=[]

    componentDidMount(){
         
        const uid = initialize.auth().currentUser.uid;
        const db = initialize.firestore();
        const database = initialize.database()
        const storage = initialize.storage();
        const ref = storage.ref("Profile_Cover");
        let temp = []
        let temp1 = []
        let temp2 = []

        db.collection("users/"+uid+"/friends").where("status","==","friend").get().then(res=>{
            res.forEach(doc=>{
                database.ref("status/"+doc.id).once('value')
                .then(res=>{
                    if(res.val().isOnline===true){
                        temp.push(res.key)
                        this.setState({onlineFriends:[...temp]})
                    }
                    return this.state.onlineFriends
                })
                .then(ress =>{
                    ref.listAll().then((res)=>{
                        res.items.forEach((itemRef)=>{
                            for(let i=0;i<ress.length;i++){
                                if("profile"+ress[i]===itemRef.name.substr(0, itemRef.name.lastIndexOf("."))){
                                    itemRef.getDownloadURL().then((url)=>{
                                        this.onlineProfilePicList[i]=url;
                                        this.setState({onlineProfilePicList:[...this.onlineProfilePicList]})
                                    })
                                    .catch(err=>{
            
                                    })
                                }
                                else{
                                    this.onlineProfilePicList[i]=quiddle
                                    this.setState({onlineProfilePicList:[...this.onlineProfilePicList]})
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
            })
        })
        .catch(err=>{
            
        })     

        db.collection("users/"+uid+"/friends").where("status","==","friend").get().then(res=>{
            let temp4=[];
            this.setState({pendingMsgCount:[]})
            res.forEach(doc=>{
                db.doc("users/"+doc.id).get()
                .then(res=>{
                    db.doc("users/"+uid+"/friends/"+res.id).get().then(resss=>{
                        temp4.push(resss.data().pendingMsg)
                        this.setState({pendingMsgCount:[...temp4]})
                    })
                    .catch(err=>{
                        
                    })
                    temp1.push(res.data().userId)
                    temp2.push(res.data().name)
                    this.setState({allFriends:[...temp1], allFriendsName:[...temp2]})
                    return this.state.allFriends
                })
                .then(ress =>{
                    for(let i=0;i<ress.length;i++){
                        db.doc("users/"+ress[i]).get().then(res=>{
                            if(res.data().profileName===undefined){
                                this.allFriendsProfile[i]=quiddle
                                this.setState({allFriendsProfilePic:[...this.allFriendsProfile]})
                            }
                            else
                            ref.child(res.data().profileName).getDownloadURL().then(url=>{
                                this.allFriendsProfile[i]=url;
                                this.setState({allFriendsProfilePic:[...this.allFriendsProfile]})
                            })
                            .catch(err=>{
                                this.allFriendsProfile[i]=quiddle
                                this.setState({allFriendsProfilePic:[...this.allFriendsProfile]})
                            })
                        })
                        .catch(err=>{

                        })
                    }
                    return ress
                })
                .then(res=>{
                    for(let i=0;i<res.length;i++){
                        let combinedDoc;
                        if(uid<res[i]){
                            combinedDoc=uid+""+res[i]
                        }
                        else{
                            combinedDoc=res[i]+""+uid
                        }
                        db.collection("chats/"+combinedDoc+"/messages/").orderBy("time","desc").limit(1).onSnapshot(res=>{
                            res.forEach(doc=>{
                                if(doc.data().sender===uid)
                                    this.allFriendsLastChat[i]="You : "+doc.data().message
                                else
                                    this.allFriendsLastChat[i]=this.state.allFriendsName[i].split(" ")[0]+" : "+doc.data().message
                            })
                        })
                    }
                    this.setState({allFriendsLastChat:[...this.allFriendsLastChat]})
                })
                .catch(err=>{
                    console.log("Error : ", err)
                }) 
            })
        })
        .catch(err=>{
            
        })  
        let temp3=[]
        db.collection("users/"+uid+"/friends").where("favourite","==",true).get().then(res=>{
            res.forEach(doc=>{
                db.doc("users/"+doc.id).get()
                .then(res=>{
                    temp3.push(res.data().userId)
                    this.setState({allFavourite:[...temp3]})
                })
                .catch(err=>{
            
                })
                return this.state.allFavourite
            })
        })
        db.collection("users/"+uid+"/notifications/").get().then(res=>{this.setState({notificationCount:res.size})})
    }

    chatHandler=(event)=>{
        window.location.href="chat?userId="+event.target.id
    }

    removeFavHandler(userId){
        if(userId===undefined)
            return
        const uid = initialize.auth().currentUser.uid;
        const db = initialize.firestore();
        db.collection("users/"+uid+"/friends").doc(userId).update({
            favourite:false
        })
        .then(res=>{
            const filteredItems = this.state.allFavourite.filter(item => !userId.includes(item))
            this.setState({allFavourite:[...filteredItems]})
        })
        .catch(err=>{
            
        })
    }

    addFavHandler(userId){
        if(userId===undefined)
            return
        const uid = initialize.auth().currentUser.uid;
        const db = initialize.firestore();
        let temp=[]
        db.collection("users/"+uid+"/friends").doc(userId).update({
            favourite:true
        }).then(res=>{

        })
        .catch(err=>{
            
        })
        temp=[...this.state.allFavourite];
        temp.push(userId)
        this.setState({allFavourite:[...temp]})
    }

    chatingHandler=(event)=>{
        window.location.href="/chat?userId="+event.target.id
    }
    render() {
        let online = null
        let chatUsers = null
        online = this.state.onlineFriends.map((res, index)=>(
                    <div key={res}>
                        <li>
                            <img onClick={this.chatingHandler} id={this.state.onlineFriends[index]} src={this.state.onlineProfilePicList[index]} alt="User Image"/>
                            <BsCircleFill className={classes.onlineIndicator}/>
                        </li>
                    </div>
        ))
        if(online.length===0){
            online=(<h5 style={{color:"black",margin:"auto"}}>None of your friend is online.</h5>)
        } 
        chatUsers = this.state.allFriendsProfilePic.map((res, index)=>(
                    <div key={index} className={classes.chatUsers}>
                        <div>
                            <div>
                                <img src={res}/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <h5 id={this.state.allFriends[index]} onClick={this.chatHandler} className={classes.chatUsersName}>
                                    {this.state.allFriendsName[index]}
                                    <span className="badge badge-info">{!this.state.pendingMsgCount[index] ? "" : this.state.pendingMsgCount[index]}</span>
                                </h5>
                                <p>{this.allFriendsLastChat[index]}</p>
                            </div>
                            <div>
                                {
                                this.state.allFavourite.includes(this.state.allFriends[index]) ?
                                <AiFillStar onClick={()=>this.removeFavHandler(this.state.allFriends[index])} name={this.state.allFriends[index]} style={{alignSelf:"center"}} color="#ffad60" size="25px"/> :
                                <AiOutlineStar onClick={()=>this.addFavHandler(this.state.allFriends[index])} name={this.state.allFriends[index]} style={{alignSelf:"center"}} color="#ffad60" size="25px"/>
                                }
                            </div>
                        </div>
                    </div>
        ))
        return (
            <div style={{marginBottom:"40px"}}>
                <header className={classes.header}>
                    <h4>Messages</h4>
                </header>
                <div className={classes.onlineUsers}>
                    <div>
                        <span>Online Users</span>
                    </div>
                    <div className="uk-position-relative uk-visible-toggle uk-light" tabIndex="-1" uk-slider="sets:false; finite:true">
                        <ul className="uk-slider-items">
                            {online}
                        </ul>
                    </div>
                </div>
                {chatUsers}
                <footer className={classes.footer}>
                    <div>
                        <a href="/notifications" className={classes.notificationAnchor}>
                            <IoIosNotifications color="#ffad60" size="30px"/>
                            <span className="badge badge-info">{this.state.notificationCount===0 ? "" : this.state.notificationCount}</span>
                        </a>
                    </div>
                    <div><a href="/profile"><BsPeopleCircle color="#ffad60" size="30px"/></a></div>
                    <div>
                        <a href="/searchfriend"><GoSearch color="#ffad60" size="30px"/></a>
                    </div>
                </footer>
            </div>
        )
    }
}

export default Message
