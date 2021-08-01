import React from 'react'
import quiddle from '../../quiddle.svg'
import classes from './ForgetPassword.module.css'
import {IoMdArrowRoundBack} from 'react-icons/io'
import { initialize } from '../config/Config'

function sendEmail(event){
    event.preventDefault()
    const auth = initialize.auth();
    const email = document.getElementById('myEmail').value;
    auth.sendPasswordResetEmail(email)
    .then(function(res){
        alert("A password reset link has been sent to your email address..");
    })
    .catch(function(error){
        alert(error.message)
    })
}

function ForgetPassword() {
    return (
        <div className="container">
            <div className={classes.logo}>
                <img src={quiddle} alt="image"/>
                <h1>Forgot Your Password?</h1>
                <h4>Let's Create A New One</h4>
            </div>
            <form>
                <div className="form-group">
                    <label>Email</label>
                    <input id="myEmail" type="email" className="form-control" aria-describedby="emailHelp"/>
                </div>
                <div className={classes.btnDiv}>
                    <button onClick={sendEmail} className={"uk-button uk-button-small "}>Send Email</button>
                </div>
                <a className={classes.back} href="/"><IoMdArrowRoundBack /> Back</a>
            </form>
        </div>
    )
}

export default ForgetPassword
