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
 
class Login extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      modalIsOpen: false
    };
 
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
 
  openModal() {
    this.setState({modalIsOpen: true});  
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
  }
 
  render() {
    return (
      <span style={this.props.style}>
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

          { this.props.signedIn && <Redirect to='/dashboard' /> }

          <div className = 'modal-content'>
            <h3 className= 'header-title' id = 'log-in-header'>{this.props.header}</h3>
{/*            <input className = 'login-text' id = "email-login" type = "text" placeholder = "email" />
            <input className = 'login-text' id = "password-login" type = "password" placeholder = "password" />
            <button className = 'primary-button' id = 'submit-email'>{this.props.header}</button>     
*/}
            <Auth 
              signedIn={this.props.signedIn}
              doGetProfilePic = {this.props.doGetProfilePic} />
          </div>
        </Modal>
      </span>
    );
  }
}

Login.propTypes = {
  signedIn: PropTypes.bool.isRequired
}
 
export default withRouter(Login);