import React from 'react';
import Modal from 'react-modal';
import { Redirect } from 'react-router-dom';
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
Modal.setAppElement('#root');
 

/*
  The LoginModal uses the Auth component, and 
  redirects to a specified page when the signedIn 
  prop is true.

  If the LoginModal doesn't dismount after logging in,
  use LoginModalPersist.
*/
class LoginModal extends React.Component {
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
    const { redirectTo, header, signedIn } = this.props;
    return (
      <span>
        <span onClick={this.openModal}>
          {this.props.children}
        </span>
        
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="log in / register"
        >

          {signedIn && <Redirect to={redirectTo} />}

          <div className = 'modal-content'>
            <h3 className= 'header-title' id = 'log-in-header'>{header}</h3>
            <Auth signedIn={signedIn} />
          </div>
        </Modal>
      </span>
    );
  }
}

LoginModal.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  redirectTo: PropTypes.string.isRequired,
  header: PropTypes.string,
  children: PropTypes.node.isRequired
};

LoginModal.defaultProps = {
  header: 'log in',
  redirectTo: routes.dashboard.base,
};
 
export default LoginModal;