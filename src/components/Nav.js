import React from 'react';
import firebase from '../utils/firebase';
import { NavLink, withRouter } from 'react-router-dom';
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
      firebase.auth().signOut().catch((err) => {
        console.log(err);
      })
    }
  }


  render() {
    return (
      <div className='nav'>
        <h1>Corbii</h1>
        <div>
          <ul className='nav-ul'>
            <li>
              <NavLink activeClassName='navlink-active' to='/decks'>
                Decks
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName='navlink-active' to='/search'>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName='navlink-active' to='/about'>
                About
              </NavLink>
            </li>
          </ul>
        </div>
        <div>
          <p>{this.props.signedIn ? this.props.name : 'not logged in'}</p>
          {this.props.profilePic && <img className='profile-img' src={this.props.profilePic} />}
          <p>
            {this.props.signedIn
              ? <button className='button' onClick={this.handleSignOut}>Sign Out</button>
              : null }
          </p>
        </div>
      </div>
    )
  }
}

Nav.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  uid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}

export default withRouter(Nav);