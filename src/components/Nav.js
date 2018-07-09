import React from 'react';
import firebase from '../utils/firebase';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { testSecurity } from '../utils/api';
import routes from '../routes/routes';
import PropTypes from 'prop-types';
import Login from './Login';

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
        }));
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
      firebase.auth().signOut().then(() => {
        this.props.history.push(routes.homeRoute);
      }).catch((err) => {
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
        <div className = 'flex-header'>
          <div>
            {this.state.signedIn
              ? <Link to={routes.dashboardRoute}>
                  <img id = 'header-logo' src='/src/resources/header-logo.png' />
                </Link>
              : <Link to={routes.homeRoute}>
                  <img id = 'header-logo' src='/src/resources/header-logo.png' />
                </Link>}

            
            {/*<button onClick={this.handleTest}>Test</button>*/}
          </div>

          <div>
            <form onSubmit={this.enterActivator}>
              <input id = "searchbar" 
                type = "text" 
                placeholder = "search . . ." 
                onChange={this.handleChangeSearch} 
                value={this.state.searchQuery} />
              <Link
                to={{
                  pathname: `${routes.searchRoute}/decks`,
                  search: `?q=${this.state.searchQuery}`
                }}>
                <button style={{display: 'none'}} type='submit'>Search</button>
              </Link>
            </form>
          </div>
        </div>

        <div id= 'navbar-usercard'>
          {this.props.profilePic 
            && <Link to='/profile'>
                  <img src={this.props.profilePic} />
               </Link>}

          <div>
            {this.state.signedIn
              ? <button className = 'nav-signin' onClick={this.handleSignOut}>sign out</button>
              : <div>
                    <Login 
                      header = "log in"
                      signedIn = {this.props.signedIn}
                      doGetProfilePic = {this.props.doGetProfilePic}
                    >
                      <button className = 'log-in' id = 'header-login'>log in </button>
                    </Login>
                </div> }
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Nav);