// imports
import firebase from '../utils/firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import parser from '../utils/parser';
import { addUser } from '../utils/api';
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

class Auth extends React.Component {

  render() {
    const firebaseUiConfig = {
      signInFlow: 'popup',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult: (authResult)  => {
          const { isNewUser } = parser.parseAuth(authResult);
          console.log(isNewUser);
          if (isNewUser) {
            addUser().catch((err) => {
              console.log(err);
            })
          }
        }
      }
    }

    if (this.props.signedIn) {
      return <Redirect to='/dashboard' />
    }

    return (
      <div>
        <h5>This will be either a separate page or a modal on the '/' path. Modals in React might be harder to animate.</h5>
        {!this.props.signedIn && <StyledFirebaseAuth uiConfig={firebaseUiConfig} firebaseAuth={firebase.auth()} />}
      </div>
    )
  }
}

Auth.propTypes = {
  signedIn: PropTypes.bool.isRequired
}

export default Auth;