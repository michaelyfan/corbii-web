import React from 'react';
import firebase from '../utils/firebase';
import { Link, NavLink, withRouter } from 'react-router-dom';
import routes from '../routes/routes';
import PropTypes from 'prop-types';
import LoginModalPersist from './LoginModalPersist';

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
    const { signedIn, photoURL, isTeacher, handleStudentClickRegister } = this.props;
    const imageLink = signedIn ? (isTeacher ? routes.teacher.dashboard : routes.dashboard.base) : routes.home.base;
    return (
      <div className = "header"> 
        <div className = 'flex-header'>
          <div>
            <Link to={imageLink}>
              <img id = 'header-logo' src='/src/resources/header-logo.png' />
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
            header = "log in"
            signedIn = {signedIn}
            isTeacher = {isTeacher} >
            <button className = 'log-in' id = 'header-login' onClick={handleStudentClickRegister}>log in </button>
          </LoginModalPersist>

          <div>
            {signedIn 
              ? <button className = 'nav-signin' onClick={this.handleSignOut}>sign out</button>
              : null
            }   
            
          </div>
        </div>
      </div>
    )
  }
}

Nav.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  isTeacher: PropTypes.bool.isRequired,
  handleStudentClickRegister: PropTypes.func.isRequired,
  photoURL: PropTypes.string
}

export default withRouter(Nav);