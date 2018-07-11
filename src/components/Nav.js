import React from 'react';
import firebase from '../utils/firebase';
import { Link, NavLink, withRouter } from 'react-router-dom';
import routes from '../routes/routes';
import PropTypes from 'prop-types';
import Login from './Login';

class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchQuery: ''
    }


    this.enterActivator = this.enterActivator.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
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
    const { signedIn, photoURL, doGetProfilePic } = this.props;
    return (
      <div className = "header"> 
        <div className = 'flex-header'>
          <div>
            <Link to={
              signedIn
                ? routes.dashboardRoute
                : routes.homeRoute
            }>
              <img id = 'header-logo' src='/src/resources/header-logo.png' />
            </Link>
          </div>

          <div>
            <form onSubmit={this.enterActivator}>
              <input 
                id = "searchbar" 
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
          {photoURL 
            && <Link to={routes.profileRoute}>
                  <img className='nav-profile-img' src={photoURL} />
               </Link>}

          <div>
            {signedIn
              ? <button className = 'nav-signin' onClick={this.handleSignOut}>sign out</button>
              : <Login 
                  header = "log in"
                  signedIn = {signedIn}
                  doGetProfilePic = {doGetProfilePic}
                >
                  <button className = 'log-in' id = 'header-login'>log in </button>
                </Login>
            }
          </div>
        </div>
      </div>
    )
  }
}

Nav.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  photoURL: PropTypes.string.isRequired,
  doGetProfilePic: PropTypes.func.isRequired
}

export default withRouter(Nav);