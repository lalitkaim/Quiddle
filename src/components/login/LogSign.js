import React, { Component } from 'react'
import classes from './LogSign.module.css'
import coverPicture from '../../cover.JPG'
import quiddle from '../../quiddle.svg'
import Signup from './Signup'
import { initialize } from '../config/Config';
import firebase from 'firebase'

class LogSign extends Component{
    constructor(props) {
        super(props)
    
        this.state = {
             email:'',
             password:'',
             firstName:'',
             lastName:'',
             username:'',
             login:true,
        }
    }

    temp = 0;

    nextHandler=(event)=>{
        event.preventDefault();
        this.temp++;
        this.forceUpdate()
    }

    inputChangedHandler=(event)=>{
        this.setState({[event.target.name]:event.target.value});
    }

    signupHandler=(event)=>{
        let db = initialize.firestore();
        let storage = initialize.storage();
        event.preventDefault();
        initialize.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(()=>{
                if(initialize.auth().currentUser){
                    localStorage.setItem('user',JSON.stringify(initialize.auth().currentUser.uid))
                    db.collection("users").doc(initialize.auth().currentUser.uid).set({
                        email: this.state.email,
                        userId:initialize.auth().currentUser.uid,
                        name : this.state.firstName+" "+this.state.lastName,
                        username : this.state.username,
                        bio : "Hey, I'm on Quiddle!",
                        country:"NA",
                        city:"NA"
                    })
                    .then(function(){
                        console.log("success")
                    })
                    .catch(function(error){
                        console.log("error", error)
                    })
                }
            })
            .catch(error => alert(error))
    }

    loginHandler=(event)=>{
        event.preventDefault();
        initialize.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(res=>{
                localStorage.setItem('user',JSON.stringify(initialize.auth().currentUser.uid))
            })
            .catch(error => alert(error))
    }

    switchToSignup=()=>{
        this.setState({login:!this.state.login})
    }

    switchToLogin=()=>{
        // this.setState({login:!this.state.login})
        // this.currentInput = null
        window.location.href="/"
    }

    componentDidMount(){
        document.getElementById("myContainer").style.minHeight = window.innerHeight+"px"
        document.getElementById("myFooter").style.top = window.innerHeight-50+"px"
    }
    render(){
        let loginButton = null;
        let signupButton = null;
        let resetPassword = null;
        let makeAccount = null;
        let alreadyAccount = null;
        let welcome = null;
        let nextButton = null;
        let loginForm = null;
        let currentInput = null
    
     

        if(this.temp===1)
            currentInput = <Signup name="password" value={this.state.password} changed={this.inputChangedHandler}/>
        if(this.temp===2)
            currentInput = <React.Fragment><Signup name="firstName" value={this.state.firstName} changed={this.inputChangedHandler}/><Signup type="text" name="lastName" value={this.state.lastName} changed={this.inputChangedHandler}/></React.Fragment>
        if(this.temp===3){
            currentInput = <Signup name="username" value={this.state.username} changed={this.inputChangedHandler}/>
            document.getElementById('next').style.display="none";
            document.getElementById('signup').style.display="inline-block";
        }

        if(this.state.login){
            loginForm = (
                <React.Fragment>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email</label>
                        <input type="email" name="email" onChange={this.inputChangedHandler} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <input type="password" name="password" onChange={this.inputChangedHandler} className="form-control" id="exampleInputPassword1"/>
                    </div>
                </React.Fragment>
            )
            loginButton = (
                <button type="submit" onClick={this.loginHandler} className={"uk-button uk-button-small "+ classes.button}>Login</button>
            )
            resetPassword = (
                <a href="/forget-password" className={classes.anchor}>Forget Password?</a>
            )
            makeAccount = (
                <p>Don't have a Quiddle account <a className={classes.anchor} onClick={this.switchToSignup}>Signup</a></p>
            )
            welcome = (
                <React.Fragment>
                    <h1 style={{fontSize:"2.3rem"}}>Welcome to</h1>
                    <h1 style={{fontSize:"2.7rem"}}>Quiddle</h1>
                </React.Fragment>
            )
        }
        else{
            nextButton = (
                <div style={{textAlign:"end", marginBottom:"10px"}}>
                    <button type="submit" id="next" onClick={this.nextHandler} className={"uk-button uk-button-small "+ classes.button}>Next</button>
                </div>
            )
            signupButton=(
                <div style={{textAlign:"end", marginBottom:"10px"}}>
                    <button type="submit" onClick={this.signupHandler} id="signup" style={{display:"none"}} className={"uk-button uk-button-small "+ classes.button}>Signup</button>
                </div>
            )
            alreadyAccount = (
                <p>Already have an account <a className={classes.anchor} onClick={this.switchToLogin}>Login</a></p>
            )
            welcome = (
                <React.Fragment>
                    <h1>Create a new</h1>
                    <h1>Quiddle account</h1>
                </React.Fragment>   
            )
            if(this.temp===0)
                currentInput = <Signup name="email" value={this.state.email} changed={this.inputChangedHandler}/>
        }
        return (
            <div className="container" id="myContainer">
                <div className={classes.containerTop}>
                    <div className={classes.LogSignImg}>
                        <img src={quiddle} />
                    </div>
                    {welcome}
                </div>
                {loginForm}
                {currentInput}
                {nextButton}
                {signupButton}
                <div style={{textAlign:"center"}}>
                    {loginButton}
                    <div>
                        {resetPassword}
                    </div>
                    {makeAccount}
                    {alreadyAccount}
                </div>
                <footer className={classes.footer} id="myFooter">
                    <p style={{margin:"2px", fontSize:"14px"}}>Terms & Conditions <a style={{textDecoration:"underline"}} href="/terms-and-conditions">Click Here</a></p>
                    <span style={{color:"#888888"}}>&copy; 2020-Present Lalit, All rights reserved</span>
                </footer>
            </div>
        )
    }
    
}

export default LogSign;
