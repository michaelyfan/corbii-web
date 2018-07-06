// imports
import firebase from '../utils/firebase';
import firebaseui from 'firebaseui';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { createNewDbUser } from '../utils/api';
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

class Auth extends React.Component {


  render() {
    console.log('rendering auth!');

    if (this.props.signedIn) {
      return <Redirect to='/dashboard' />
    }

    const firebaseUiConfig = {
      signInFlow: 'popup',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
      callbacks: {
        signInSuccessWithAuthResult: (authResult)  => {
          if (authResult.additionalUserInfo.isNewUser) {
            createNewDbUser().then(() => {
              this.props.doGetProfilePic();
            }).catch((err) => {
              console.log(err);
            })
          }
        }
      }
    }

    return (
      <div>
        {/*Below will be either a separate page or a modal on the '/' path. Modals in React might be harder to animate.*/}
        {!this.props.signedIn && <StyledFirebaseAuth uiConfig={firebaseUiConfig} firebaseAuth={firebase.auth()} />}
      </div>
    )
  }
}

Auth.propTypes = {
  signedIn: PropTypes.bool.isRequired
}

export default Auth;