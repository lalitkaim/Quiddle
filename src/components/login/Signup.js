import React from 'react'

function Signup(props) {
    let myInput = null
    switch(props.name){
        case 'email':
            myInput  =  <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Email</label>
                            <input type="email" name="email" className="form-control" id="exampleInputEmail1" value={props.value} onChange={props.changed}/>
                        </div>
            break;
        case 'password':
            myInput  =  <div className="form-group">
                            <label>Password</label>
                            <input type="password" name="password" className="form-control" value={props.value} onChange={props.changed}/>
                        </div>
            break;
        case 'firstName':
            myInput  =  <div className="form-group">
                            <label>First Name</label>
                            <input type="text" name="firstName" className="form-control" value={props.value} onChange={props.changed}/>
                        </div>
            break;
        case 'lastName':
            myInput  =  <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" name="lastName" className="form-control" value={props.value} onChange={props.changed}/>
                        </div>
            break;
        case 'username':
            myInput  =  <div className="form-group">
                            <label>Username</label>
                            <input type="text" name="username" className="form-control" value={props.value} onChange={props.changed}/>
                        </div>
            break;
        default:
            myInput = null
    }   
    return (myInput);
}

export default Signup;
