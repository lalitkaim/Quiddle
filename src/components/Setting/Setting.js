import React, { Component } from 'react'
import classes from './Setting.module.css'
import {MdSettings} from 'react-icons/md'
import {IoMdArrowRoundBack} from 'react-icons/io'
import { initialize } from '../config/Config'

class Setting extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             username:"",
             bio:"",
             name:"",
             country:"",
             city:""
        }
    }
    
    inputHandler=(event)=>{
        this.setState({
            [event.target.name]:event.target.value
        })
    }

    componentDidMount(){
        const db = initialize.firestore();
        db.collection("users").doc(initialize.auth().currentUser.uid).get()
        .then(res=>{
            this.setState({
                username:res.data().username,
                bio:res.data().bio,
                name:res.data().name,
                country:res.data().country,
                city:res.data().city,
            })
        })
        .catch(err=>{
            
        })
    }

    updateHandler=()=>{
        const db = initialize.firestore();
        db.collection("users").doc(initialize.auth().currentUser.uid).update(
        {
            username:this.state.username,
            bio:this.state.bio,
            name:this.state.name,
            country:this.state.country,
            city:this.state.city
        })
        .then(res=>{
            alert("Updated Successfully")
        })
        .catch(err=>{
            
        })
    }

    goBackHandler(){
        window.location.href="/profile"
    }

    render() {
        return (
            <div className={classes.mainDiv}>
                <header className={classes.header}>
                    <h4><a onClick={this.goBackHandler}><IoMdArrowRoundBack color="black" size="28px"/></a>Settings</h4>
                    <MdSettings size="25px"/>
                </header>
                <div className={classes.formDiv}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" name="username" className="form-control" onChange={this.inputHandler} value={this.state.username}/>
                        {/* <small className="form-text text-muted">username must be unique!</small> */}
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea type="text" name="bio" maxLength="150" className="form-control" onChange={this.inputHandler} value={this.state.bio}/>
                        <small className="form-text text-muted">Bio can be maximum of 150 letters.</small>
                    </div>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" className="form-control" onChange={this.inputHandler} value={this.state.name}/>
                    </div>
                    <div className="form-group">
                        <label>Country</label>
                        <input type="text" name="country" className="form-control" onChange={this.inputHandler} value={this.state.country}/>
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input type="text" name="city" className="form-control" onChange={this.inputHandler} value={this.state.city}/>
                    </div>
                    <button type="submit" onClick={this.updateHandler} className={"uk-button float-right "+classes.button}>Update</button>
                </div>
            </div>
        )
    }
}

export default Setting
