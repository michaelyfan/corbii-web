import React from 'react';
import firebase from '../utils/firebase';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { testSecurity } from '../utils/api';
import PropTypes from 'prop-types';

class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: 'not logged in',
      signedIn: false,
      searchQuery: ''
    }


    this.enterActivator = this.enterActivator.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleTest = this.handleTest.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState(() => ({
          name: user.displayName,
          signedIn: true
        }), () => {
        })
      } else {
        this.setState(() => ({
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

  handleChangeSearch(e) {
    e.persist();
    this.setState(() => ({
      searchQuery: e.target.value
    }))
  }

  enterActivator(e) {
    e.preventDefault();
  }

  render() {

    return (
      <div className='nav'>
        <div>
          <Link to='/'>
            <img src='../src/resources/corbii_transparent.png' className='nav-logo' />
          </Link>
          {/*<button onClick={this.handleTest}>Test</button>*/}
        </div>
        
        <div>
          <form onSubmit={this.enterActivator}>
            <input placeholder='Search decks...' type='text' onChange={this.handleChangeSearch} value={this.state.searchQuery} />
            <Link
              to={{
                pathname: '/search/decks',
                search: `?q=${this.state.searchQuery}`
              }}>
              <button type='submit'>Search</button>
            </Link>
          </form>
        </div>

        <div>
          <p>
            {this.state.signedIn
              ? this.state.name
              : 'not logged in'}
          </p>
          {this.props.profilePic && <img className='nav-profile-img' src={this.props.profilePic} />}
          <p>
            {this.state.signedIn
              ? <Link to='/profile'>
                  <button>
                    My Profile
                  </button>
                </Link>
              : null }
          </p>
          <p>
            {this.state.signedIn
              ? <button onClick={this.handleSignOut}>Sign Out</button>
              : null }
          </p>
        </div>
      </div>
    )
  }
}

export default withRouter(Nav);