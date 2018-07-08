import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, updateCurrentUserProfilePic } from '../utils/api';

class Profile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: ''
    }

    this.inputFile = React.createRef();
    this.handleChangeProfilePic = this.handleChangeProfilePic.bind(this);
  }

  componentDidMount() {
     this.getUser();
  }


  getUser() {
    getCurrentUser().then((result) => {
      this.setState(() => ({
        name: result.name,
        email: result.email,
      }));
    }).catch((err) => {
      console.log(err);
      this.setState(() => ({statusText:'There was an error. Check the console and refresh the app.'}))
    })
  }

  handleChangeProfilePic(e) {
    e.preventDefault();
    const files = this.inputFile.current.files;
    if (files == null || files.length <= 0) {
      this.setState(() => ({statusText: 'You haven\'t uploaded any files!'}))
    } else {
      updateCurrentUserProfilePic(files[0]).then(() => {
        this.setState(() => ({statusText: 'Successfully uploaded!'}));
        this.props.doGetProfilePic().catch((err) => {
          this.setState(() => ({statusText:'There was an error. Check the console and refresh the app.'}))    
        });
      }).catch((err) => {
        this.setState(() => ({statusText:'There was an error. Check the console and refresh the app.'}))
      });
    }
    
  }

  render() {
    return (
      <div className='profile'>
        <div>
          <p>{this.state.statusText}</p>
          <h1 className = 'username'>{this.state.name}</h1>
          <h3 className = 'email'>{this.state.email}</h3>
          <div className = 'hr'><hr /></div>
          <div className = 'profile-pic'>
            <div>{this.props.profilePic && <img className='profile-img' src={this.props.profilePic} />}</div>
            <form className = 'upload-photo' onSubmit={this.handleChangeProfilePic}>
              <span id = 'change-pic'>change profile pic: &nbsp;</span>
              <input ref={this.inputFile} type='file' text='Change profile pic' /><br />
              <button className = 'primary-button' id = 'upload-button' type='submit'>upload</button>
            </form>
            <div className = 'dashboard-link'>
              <Link to='/dashboard'>
                <button className = 'dashboard-button'>go to dashboard</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Profile;