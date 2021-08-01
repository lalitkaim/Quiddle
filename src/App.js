import React, { Component } from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import LogSign from './components/login/LogSign';
import firebase from 'firebase'
import Message from './components/message/Message';
import Profile from './components/profile/Profile';
import UserProfile from './components/userprofile/UserProfile';
import PageNotFound from './components/pagenotfound/PageNotFound';
import ForgetPassword from './components/forgetpassword/ForgetPassword';
import Setting from './components/Setting/Setting';
import Chat from './components/Chat/Chat';
import Notification from './components/notification/Notification';
import ShowPost from './components/showpost/ShowPost';
import SearchFriend from './components/searchfriends/SearchFriend';
import { initialize } from './components/config/Config';
import TermsAndConditions from './components/termandcondition/TermsAndConditions';

class App extends Component{
  constructor(props) {
    super(props)
  
    this.state = {
       user : null
    }
  }
  
  componentDidMount(){
    this.authListener();
  }

  authListener=()=>{
    initialize.auth().onAuthStateChanged((user)=>{
      if(user){
        this.setState({user:user})
      }
      else{
        this.setState({user:null})
      }
    })
  }

  render(){
    let afterAuth = null
    if(this.state.user){

      if(initialize.auth().currentUser){
        var uid = initialize.auth().currentUser.uid;
        var userStatusDatabaseRef = initialize.database().ref('/status/' + uid);
        var isOfflineForDatabase = {
          isOnline: false,
          last_changed: firebase.database.ServerValue.TIMESTAMP,
        };
        var isOnlineForDatabase = {
          isOnline: true,
          last_changed: firebase.database.ServerValue.TIMESTAMP,
        };
        initialize.database().ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() === false) {
                return;
            };
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
                userStatusDatabaseRef.set(isOnlineForDatabase);
            })
            .catch(err=>{
              
            })
        });
      }

      afterAuth =(
        <React.Fragment>
          <Switch>
            <Route path="/" exact={true} component={Message}/>
            <Route path="/profile" component={Profile}/>
            <Route path="/userprofile" component={UserProfile}/>
            <Route path="/chat" component={Chat}/>
            <Route path="/notifications" component={Notification}/>
            <Route path="/showpost" component={ShowPost}/>
            <Route path="/searchfriend" component={SearchFriend}/>
            <Route path="/settings" component={Setting}/>
            <Route path="/404" component={PageNotFound}/>
            <Redirect to="/404"/>
          </Switch>
        </React.Fragment>
      )      
    }
    else if(!localStorage.getItem('user')){
      afterAuth=(
        <React.Fragment>
          <Switch>
            <Route path="/" exact component={LogSign}/>
            <Route path="/forget-password" component={ForgetPassword}/>
            <Route path="/terms-and-conditions" component={TermsAndConditions}/>
            <Route path="/404" component={PageNotFound}/>
            <Redirect to="/404"/>
          </Switch>
        </React.Fragment>
      )
    }

    if(navigator.appVersion.indexOf("Android")!==-1 || navigator.appVersion.indexOf("iPhone")!==-1){
      return (
        <div>
          {afterAuth}
        </div>
      )
    }
    else{
      return (
        <div>
          <video style={{position:"fixed",objectFit:"cover",width:"100%",height:"100%",left:0,top:0}} autoPlay loop muted src="https://assets.mixkit.co/video-templates/preview/mixkit-splash-transition-from-bottom-31-large.mp4"/>
          <div style={{textAlign:"center",position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)"}}>
            <h1>KEEP CALM</h1>
            <h1>QUIDDLE IS</h1>
            <h5>FOR</h5>
            <h1>MOBILE</h1>
            <h1>DEVICES</h1>
            <h5>NOT</h5>
            <h1>DESKTOP</h1>
          </div>
        </div>
      )
    }
  }
}

export default App;
