import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Auth from './Auth.js';
import routes from '../routes/routes';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};
 
// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')
 

/*
  The LoginModalPersist uses the Auth component, and does a
  one-time redirect to a specified page after a successful login.
  After the one-time redirect, the modal closes.

  The login activator's display is none if the user is signedIn.
  
  LoginModalPersist is meant for applications where the login activator
  is located on a persisting element before and after signing in, such as a navbar.
*/
class LoginModalPersist extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      modalIsOpen: false,
      displayStyle: 'block',
      shouldRedirect: false
    };
 
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { signedIn, redirectTo } = this.props;
    if (signedIn != prevProps.signedIn) {
      if (signedIn && this.state.shouldRedirect) {
        this.props.history.push(redirectTo);
        this.closeModal();
      }
      this.setState(() => ({
        displayStyle: signedIn ? 'none' : 'block'
      }))
    }
  }

  openModal() {
    this.setState({modalIsOpen: true});  
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
  }

  loginCallback() {
    this.props.history.push(this.props.redirectTo);
    this.setState(() => ({shouldRedirect: true}));
  }
 
  render() {
    const { redirectTo, header, signedIn, doGetProfilePic } = this.props;

    return (
      <span style={{display: this.state.displayStyle}}>
        <span onClick={this.openModal}>
          {this.props.children}
        </span>
        
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="log in"
        >

          <div className = 'modal-content'>
            <h3 className= 'header-title' id = 'log-in-header'>{header}</h3>
{/*            <input className = 'login-text' id = "email-login" type = "text" placeholder = "email" />
            <input className = 'login-text' id = "password-login" type = "password" placeholder = "password" />
            <button className = 'primary-button' id = 'submit-email'>{header}</button>     
*/}
            <Auth 
              signedIn={signedIn}
              doGetProfilePic = {doGetProfilePic}
              loginSuccessCallback = {this.loginCallback} />
          </div>
        </Modal>
      </span>
    );
  }
}

LoginModalPersist.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  doGetProfilePic: PropTypes.func.isRequired,
  header: PropTypes.string,
  redirectTo: PropTypes.string

}

LoginModalPersist.defaultProps = {
  redirectTo: '/dashboard',
  header: 'log in'
}
 
export default withRouter(LoginModalPersist);