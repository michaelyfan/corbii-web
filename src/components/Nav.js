import React from 'react';
import firebase from '../utils/firebase';
import { Link, withRouter } from 'react-router-dom';
import routes from '../routes/routes';
import PropTypes from 'prop-types';
import LoginModalPersist from './LoginModalPersist';

// image assets
import logoImg from '../resources/header-logo.png';

class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchQuery: ''
    };

    this.enterActivator = this.enterActivator.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut() {
    const user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().signOut().then(() => {
        this.props.history.push(routes.home.base);
      }).catch((err) => {
        console.log(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      });
    }
  }

  handleChangeSearch(e) {
    e.persist();
    this.setState(() => ({
      searchQuery: e.target.value
    }));
  }

  enterActivator(e) {
    e.preventDefault();
  }

  render() {
    const { signedIn, photoURL } = this.props;
    const imageLink = signedIn ? routes.dashboard.base : routes.home.base;
    return (
      <div className = "header"> 
        <div className = 'flex-header'>
          <div>
            <Link to={imageLink}>
              <img id = 'header-logo' src={logoImg} />
            </Link>
          </div>

          <div>
            <form onSubmit={this.enterActivator}>
              <input 
                id = "searchbar" 
                maxLength='1000'
                type = "text" 
                placeholder = "search . . ." 
                onChange={this.handleChangeSearch} 
                value={this.state.searchQuery} />
              <Link
                to={{
                  pathname: routes.search.base,
                  search: routes.search.getQueryString('decks', this.state.searchQuery)
                }}>
                <button style={{display: 'none'}} type='submit'>Search</button>
              </Link>
            </form>
          </div>
        </div>

        <div id= 'navbar-usercard'>
          {photoURL 
            && <Link to={routes.profile.base}>
              <img className='nav-profile-img' src={photoURL} />
            </Link>}

          <LoginModalPersist 
            header= "log in or register"
            signedIn = {signedIn} >
            <button className = 'log-in' id = 'header-login'>log in</button>
          </LoginModalPersist>

          <div>
            {signedIn 
              ? <button className = 'nav-signin' onClick={this.handleSignOut}>sign out</button>
              : null
            }   
            
          </div>
        </div>
      </div>
    );
  }
}

Nav.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  photoURL: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

export default withRouter(Nav);