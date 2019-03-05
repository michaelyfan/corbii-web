import React from 'react';
import DeckList from './DeckList';
import ConceptListList from './ConceptListList';
import ClassroomList from './teacher-student/ClassroomList';
import Profile from './Profile';
import { Link } from 'react-router-dom';
import firebase from '../utils/firebase';
import routes from '../routes/routes';

const sassyMessage = 'You managed to get to this page even though there\'s no active user session. This could mean that there\'s a bug on our end, and for that, we\'re terribly sorry and we\'ll get to it soon. This could also mean that you tampered with the frontend state to access an unauthorized page. If that\'s the case, congratulations, but you won\'t get anywhere from here. But have fun pretending that you know how to hack :)';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '', 
      active: 0
    };
  }

  componentDidMount() {
    const user = firebase.auth().currentUser;
    if (user) {
      this.setState(() => ({name: firebase.auth().currentUser.displayName}));
    } else {
      console.log(sassyMessage);
    }
  }

  renderSwitch() {
    switch(this.state.active) {
    case 0:
      return <DeckList />;
    case 1:
      return <ConceptListList />;
    case 2:
      return <ClassroomList />;
    case 3:
      return <Profile />;
    }
  }

  render() {
    return ( 
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <h3 className = 'header-title' id = 'dashboard-welcome'>Welcome, 
            <span className = 'emphasized-words' id = 'username'> { this.state.name } </span>
          </h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <div className ='navigation'>
              <Link to={routes.create.base}>
                <button className = 'dash-nav'>create deck or concept list</button>
              </Link>
              <button className = 'dash-nav' onClick={() => {this.setState(() => ({active: 0}));}}>my decks</button>
              <br />
              <button className = 'dash-nav' onClick={() => {this.setState(() => ({active: 1}));}}>my concept lists</button>
              <br />
              <button className = 'dash-nav' onClick={() => {this.setState(() => ({active: 2}));}}>my classrooms</button>
              <br />
              <Link to={routes.profile.base}>
                <button className = 'dash-nav' id = 'profile-settings'>profile settings</button>
              </Link>
            </div>
          </div>

          <div className = 'active-view'>
            {this.renderSwitch(this.state.active)}
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;