import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCurrentUserProfileInfo, updateCurrentUserProfilePic, sendPasswordResetEmail } from '../utils/api';
import routes from '../routes/routes';

class Profile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      passwordEmailSent: false
    };

    this.inputFile = React.createRef();
    this.handleChangeProfilePic = this.handleChangeProfilePic.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
  }

  componentDidMount() {
    this.getUser();
  }


  getUser() {
    getCurrentUserProfileInfo().then((result) => {
      this.setState(() => ({
        name: result.data().name,
        email: result.data().email
      }));
    }).catch((err) => {
      console.log(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }

  handleChangeProfilePic(e) {
    e.preventDefault();
    const files = this.inputFile.current.files;
    const file = files[0];
    if (files == null || files.length <= 0) {
      alert('You haven\'t chosen any files!');
    } else if (!file.name.match(/.(jpg|jpeg|png|gif)$/i)) {
      alert('File type must be a JPG, PNG, or GIF image.');
    } else if (file.size > 100 * 1024) {
      alert('File size must be under 100 KB.');
    } else {
      updateCurrentUserProfilePic(file).then(() => {
        this.props.doGetProfilePic();
      }).catch((err) => {
        console.log(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      });
    } 
  }

  handleChangePassword() {
    sendPasswordResetEmail().then(() => {
      this.setState(() => ({
        passwordEmailSent: true
      }));
    }).catch((err) => {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }

  render() {
    const { isTeacher } = this.props;
    const { name, email, passwordEmailSent } = this.state;
    return (
      <div className='profile'>
        <div>
          <h1 className = 'username'>{name}</h1>
          <h3 className = 'email'>{email}</h3>
          {/* Below style is done so that the 'Change password' button doesn't have a clickbox
            that spans the whole width of the page */}
          <div style={{display: 'flex', justifyContent: 'center'}}>
            { passwordEmailSent
              ? <div>
                <h3 className = 'email'>Password reset information has been sent to your email.</h3>
                <p>If you logged in with Google or Facebook, the user/pass login method will be available once you set a password.</p>
              </div>
              : <h3 className = 'email hover-text-button' onClick={this.handleChangePassword}>Change password?</h3>
            }
          </div>
          <div className = 'hr'><hr /></div>
          <div className = 'profile-pic'>
            <div className = 'profile-padding'>{this.props.photoURL && <img className='profile-img' src={this.props.photoURL} />}</div>
            <form className = 'upload-photo' onSubmit={this.handleChangeProfilePic}>
              <span id = 'change-pic'>change profile pic: &nbsp;</span>
              <input ref={this.inputFile} type='file' accept="image/*" text='Change profile pic' /><br /><br />
              <button className = 'primary-button' id = 'upload-button' type='submit'>upload</button>
            </form>
            <div className = 'dashboard-link'>
              <Link to={isTeacher ? routes.teacher.dashboard : routes.dashboard.base}>
                <button className = 'dashboard-button'>go to dashboard</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  doGetProfilePic: PropTypes.func.isRequired,
  photoURL: PropTypes.string.isRequired,
  isTeacher: PropTypes.bool.isRequired
};

export default Profile;