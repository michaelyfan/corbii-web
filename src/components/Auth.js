// imports
import firebase from '../utils/firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import parser from '../utils/parser';
import { addUser } from '../utils/api';
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      statusText: '',
    }

  }

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
          const { isNewUser, uid, name } = parser.parseAuth(authResult);
          this.setState(() => ({
            statusText: 'Successfully logged in!'
          }));
          if (isNewUser) {
            addUser(uid, name, () => {
              this.setState(() => ({
                statusText: 'There was an error. View the console and refresh the page.'
              }))
            })
          } 
        }
      }
    }

    if (this.props.signedIn) {
      return <Redirect to='/decks' />
    }

    return (
      <div>
        {!this.props.signedIn && <StyledFirebaseAuth uiConfig={firebaseUiConfig} firebaseAuth={firebase.auth()} />}
        <p>{this.state.statusText}</p>
      </div>
    )
  }
}

Auth.propTypes = {
  uid: PropTypes.string.isRequired,
  profilePic: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  signedIn: PropTypes.bool.isRequired
}

export default Auth;