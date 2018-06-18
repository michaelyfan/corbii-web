import React from 'react';
import { Link } from 'react-router-dom';
import { getUserSelf, updateProfilePic } from '../utils/api';

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
    if (this.props.signedIn) {
       this.getUser();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.signedIn === true && this.props.signedIn != prevProps.signedIn) {
      this.getUser();
    }
  }

  getUser() {
    getUserSelf().then((result) => {
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
      updateProfilePic(files[0]).then(() => {
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
        {this.props.signedIn
          ? <div>
              <p>{this.state.statusText}</p>
              <h1>{this.state.name}</h1>
              <h3>{this.state.email}</h3>
              <div>{this.props.profilePic && <img className='profile-img' src={this.props.profilePic} />}</div>
              <form onSubmit={this.handleChangeProfilePic}>
                <span>Change profile pic:</span>
                <input ref={this.inputFile} type='file' text='Change profile pic' /><br />
                <button type='submit'>Upload</button>
              </form>
              

              <Link to='/dashboard'>
                <button>Your decks</button>
              </Link>
            </div>
          : <h2>Sign in to view your profile.</h2>}
        
      </div>
    )
  }
}

export default Profile;