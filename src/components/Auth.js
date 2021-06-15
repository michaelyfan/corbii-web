import React from 'react';
import PropTypes from 'prop-types';
import * as firebaseui from 'firebaseui';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from '../utils/firebase';

class Auth extends React.Component {
  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    loginSuccessCallback: PropTypes.func,
    loginFailureCallback: PropTypes.func
  };

  render() {
    const { signedIn, loginSuccessCallback, loginFailureCallback } = this.props;
    const firebaseUiConfig = {
      signInFlow: 'popup',
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          fullLabel: 'Log in or register'
        }
      ],
      callbacks: {
        signInSuccessWithAuthResult: ()  => {
          if (loginSuccessCallback) {
            loginSuccessCallback();
          }
        },
        signInFailure: () => {
          if (loginFailureCallback) {
            loginFailureCallback();
          }
        }
      }
    };

    return (
      <div>
        {/*Below will be either a separate page or a modal on the '/' path. Modals in React might be harder to animate.*/}
        {signedIn
          ? <h2>Loading...</h2>
          : <StyledFirebaseAuth uiConfig={firebaseUiConfig} firebaseAuth={firebase.auth()} />}
      </div>
    );
  }
}

export default Auth;