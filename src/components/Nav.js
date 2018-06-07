import React from 'react';
import firebase from '../utils/firebase';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    }

    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut() {
    const user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().signOut().then(() => {
        
      }).catch((err) => {
        console.log(err);
      })
    }
  }


  render() {
    return (
      <div>
        <h1>Corbii</h1>
        <p>Logged in as: {this.props.signedIn ? this.props.name : 'not logged in'}</p>
        {this.props.profilePic && <img className='profile-img' src={this.props.profilePic} />}
        <br />
        {this.props.signedIn
          ? <button className='button' onClick={this.handleSignOut}>Sign Out</button>
          : null }
      </div>
    )
  }
}

Nav.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  profilePic: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}

export default withRouter(Nav);