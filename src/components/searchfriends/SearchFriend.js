import React, { Component } from 'react'
import classes from './SearchFriend.module.css'
import {FiSearch} from 'react-icons/fi'
import quiddle from '../../quiddle.svg'
import {IoMdArrowRoundBack} from 'react-icons/io'
import { initialize } from '../config/Config'

class SearchFriend extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             searchQuery:'',
             profilePicList:[]
        }
        this.inputRef = React.createRef();
    }

    nameList=[];
    countryList=[];
    cityList=[];
    userIdList=[];
    profilePicList=[]

    inputHandler=(event)=>{
        this.setState({searchQuery:event.target.value})
    }

    resultHandler=()=>{
        this.profilePicList=[]
        this.userIdList=[]
        this.nameList=[]
        this.countryList=[]
        this.cityList=[]
        const db = initialize.firestore();
        const storage = initialize.storage();
        const ref = storage.ref("Profile_Cover");
        db.collection("users").where("name",">=", this.state.searchQuery.toUpperCase()).get()
        .then(snapshot=>{
            snapshot.forEach(doc=>{
                this.nameList.push(doc.data().name);
                this.cityList.push(doc.data().city);
                this.countryList.push(doc.data().country);
                this.userIdList.push(doc.data().userId);
            })
            return this.userIdList
        })
        .then(ress =>{
            ref.listAll().then((res)=>{
                res.items.forEach((itemRef)=>{
                    for(let i=0;i<ress.length;i++){
                        if("profile"+ress[i]===itemRef.name.substr(0, itemRef.name.lastIndexOf("."))){
                            itemRef.getDownloadURL().then((url)=>{
                                this.profilePicList[i]=url;
                                this.setState({profilePicList:this.profilePicList})
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
    }

    userProfileHandler=(event)=>{
        window.location.href="/userprofile?userId="+event.target.id
    }

    componentDidMount(){
        this.inputRef.current.focus()
    }
    render() {
        let searchList=null;
        let temp = this.profilePicList.filter(el => {return el})
        searchList = this.userIdList.map((res, index)=>
                        this.profilePicList[index] ?
                        (<div className={classes.searchUsers} key={index}>
                            <div id={res}>
                                <div id={res}>
                                    <img src={this.profilePicList[index]} alt="Profile"/>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <h5 id={res} onClick={this.userProfileHandler}>{this.nameList[index]}</h5>
                                    <p>{this.cityList[index]+", "+this.countryList[index]}</p>
                                </div>
                            </div>
                        </div>) :
                        (<div className={classes.searchUsers} key={index}>
                            <div id={res}>
                                <div id={res}>
                                    <img src={quiddle} alt="Default Profile"/>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <h5 id={res} onClick={this.userProfileHandler}>{this.nameList[index]}</h5>
                                    <p>{this.cityList[index]+", "+this.countryList[index]}</p>
                                </div>
                            </div>
                        </div>)
                    )

        return (
            <div>
                <header className={classes.backward}>
                    <div>
                        <a href="/"><IoMdArrowRoundBack size="30px" color="black"/></a>
                    </div>
                </header>
                <div className={classes.header}>
                    <div className="input-group">
                        <input type="text" ref={this.inputRef} onChange={this.inputHandler} value={this.state.searchQuery} className="form-control" placeholder="Search..."/>
                        <div className={"input-group-append "+classes.sendBtn}  onClick={this.resultHandler}>
                            <span className="input-group-text"><FiSearch size="25px" color="white"/></span>
                        </div>
                    </div>
                </div>
                <div className={classes.searchMainDiv}>
                    {searchList}
                </div>
            </div>
        )
    }
}

export default SearchFriend
