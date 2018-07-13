import React from 'react';
import PropTypes from 'prop-types';
import firebaseui from 'firebaseui';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from '../utils/firebase';
import { createNewDbUser } from '../utils/api';

class Auth extends React.Component {


  render() {
    const { signedIn, doGetProfilePic, loginSuccessCallback, loginFailureCallback } = this.props;
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
              doGetProfilePic();
            }).catch((err) => {
              console.log(err);
            })
          }
          if (loginSuccessCallback) {
            loginSuccessCallback();
          }
        },
        signInFailure: (error) => {
          if (loginFailureCallback) {
            loginFailureCallback();
          }
        }
      }
    }

    return (
      <div>
        {/*Below will be either a separate page or a modal on the '/' path. Modals in React might be harder to animate.*/}
        {!signedIn && <StyledFirebaseAuth uiConfig={firebaseUiConfig} firebaseAuth={firebase.auth()} />}
      </div>
    )
  }
}

Auth.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  doGetProfilePic: PropTypes.func.isRequired,
  loginSuccessCallback: PropTypes.func,
  loginFailureCallback: PropTypes.func
}

export default Auth;