import React from 'react'
import classes from './PageNotFound.module.css'
import {FaSadTear} from 'react-icons/fa'

function PageNotFound() {
    return (
        <div>
            <video className={classes.backvideo} muted autoPlay loop src="https://assets.mixkit.co/videos/preview/mixkit-green-vailed-chameleon-seen-from-one-side-1489-large.mp4" />
            <h1 style={{fontSize:'70px', color:'white', position:"relative", width:"90%", margin:"auto"}}>Sorry<FaSadTear/>!</h1>
            <div className={classes.content}>
                <h2>404 The Page Can't Be Found</h2>
                <a href="/" className="uk-button">Homepage</a>
            </div>
        </div>
    )
}

export default PageNotFound
