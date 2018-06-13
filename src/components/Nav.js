import React from 'react';
import firebase from '../utils/firebase';
import { NavLink, withRouter } from 'react-router-dom';
import { testSecurity } from '../utils/api';
import PropTypes from 'prop-types';

class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      profilePic: null,
      name: 'not logged in',
      signedIn: false
    }

    this.handleTest = this.handleTest.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState(() => ({
          profilePic: user.photoURL,
          name: user.displayName,
          signedIn: true
        }))
      } else {
        this.setState(() => ({
          profilePic: null,
          name: 'not logged in',
          signedIn: false
        }))
      }
    });
  }

  handleSignOut() {
    const user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().signOut().catch((err) => {
        console.log(err);
      })
    }
  }

  handleTest() {
    testSecurity().then(() => {console.log('Success')}).catch((err) => {console.error(err)});
  }


  render() {

    return (
      <div className='nav'>
        <div>
          <h1>Corbii</h1>
          <button onClick={this.handleTest}>Test</button>
        </div>
        
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
          <p>
            {this.state.signedIn
              ? this.state.name
              : 'not logged in'}
          </p>
          {this.state.profilePic && <img className='profile-img' src={this.state.profilePic} />}
          <p>
            {this.state.signedIn
              ? <button className='button' onClick={this.handleSignOut}>Sign Out</button>
              : null }
          </p>
        </div>
      </div>
    )
  }
}

export default withRouter(Nav);