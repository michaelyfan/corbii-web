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
      <div className = "header"> 
        <div>
          <Link to='/'>
             <img id = 'header-logo' src='/src/resources/header-logo.png' />
          </Link>
          {/*<button onClick={this.handleTest}>Test</button>*/}
        </div>
        

        <div>
          <form onSubmit={this.enterActivator}>
            <input id = "searchbar" 
              type = "text" 
              placeholder = "search. . ." 
              onChange={this.handleChangeSearch} 
              value={this.state.searchQuery} />
            <Link
              to={{
                pathname: '/search/decks',
                search: `?q=${this.state.searchQuery}`
              }}>
              <button style={{display: 'none'}} type='submit'>Search</button>
            </Link>
          </form>
        </div>

        <div id= 'navbar-usercard'>
          {this.props.profilePic 
            && <Link to='/profile'>
                  <img className='nav-profile-img' src={this.props.profilePic} />
               </Link>}

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