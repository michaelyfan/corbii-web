import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCurrentUserProfileInfo, updateCurrentUserProfilePic } from '../utils/api';
import routes from '../routes/routes';

class Profile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: ''
    };

    this.inputFile = React.createRef();
    this.handleChangeProfilePic = this.handleChangeProfilePic.bind(this);
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
      });
    } 
  }

  render() {
    return (
      <div className='profile'>
        <div>
          <h1 className = 'username'>{this.state.name}</h1>
          <h3 className = 'email'>{this.state.email}</h3>
          <div className = 'hr'><hr /></div>
          <div className = 'profile-pic'>
            <div className = 'profile-padding'>{this.props.photoURL && <img className='profile-img' src={this.props.photoURL} />}</div>
            <form className = 'upload-photo' onSubmit={this.handleChangeProfilePic}>
              <span id = 'change-pic'>change profile pic: &nbsp;</span>
              <input ref={this.inputFile} type='file' accept="image/*" text='Change profile pic' /><br />
              <button className = 'primary-button' id = 'upload-button' type='submit'>upload</button>
            </form>
            <div className = 'dashboard-link'>
              <Link to={routes.dashboard.base}>
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
  photoURL: PropTypes.string.isRequired
};

export default Profile;