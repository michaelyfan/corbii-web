import React from 'react';
import Modal from 'react-modal';
import { withRouter } from 'react-router-dom';
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
 
// This binds the modal to the appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

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

  componentDidUpdate(prevProps, prevState) {
    const { signedIn, redirectTo } = this.props;
    const { shouldRedirect } = this.state;
    if (signedIn != prevProps.signedIn || shouldRedirect != prevState.shouldRedirect) {
      this.setState(() => ({
        displayStyle: signedIn ? 'none' : 'block'
      }));

      if (signedIn && shouldRedirect) {
        this.props.history.push(redirectTo);
        this.closeModal();
        this.setState(() => ({
          shouldRedirect: false
        }));
      }
    }
    
  }

  openModal() {
    this.setState({modalIsOpen: true});  
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
  }

  loginCallback() {
    this.setState(() => ({shouldRedirect: true}));
  }
 
  render() {
    const { header, signedIn } = this.props;


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
            <Auth
              signedIn={signedIn}
              loginSuccessCallback = {this.loginCallback} />
          </div>
        </Modal>
      </span>
    );
  }
}

LoginModalPersist.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  redirectTo: PropTypes.string.isRequired,
  header: PropTypes.string,
  children: PropTypes.node.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

LoginModalPersist.defaultProps = {
  redirectTo: routes.dashboard.base,
  header: 'log in'
};
 
export default withRouter(LoginModalPersist);