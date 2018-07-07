import React from 'react';
import PropTypes from 'prop-types';
import DeckList from './DeckList';
import ConceptListList from './ConceptListList';
import { Link } from 'react-router-dom';
import firebase from '../utils/firebase';

const sassyMessage = "You managed to get to this page even though there's no active user session. This could mean that there's a bug on our end, and for that, we're terribly sorry and we'll get to it soon. This could also mean that you tampered with the frontend state to access an unauthorized page. If that's the case, congratulations, but you won't get anywhere from here. But have fun pretending that you know how to hack :)";

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '' 
    }
  }

  componentDidMount() {
    const user = firebase.auth().currentUser;
    if (user) {
      this.setState(() => ({name: firebase.auth().currentUser.displayName}));
    } else {
      alert(sassyMessage);
    }
  }

  render() {
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <h3 className = 'header-title' id = 'dashboard-welcome'>Welcome, 
            <span className = 'emphasized-words'> { this.state.name } </span>
          </h3>
        </div>

        <div className = 'create-a-deck'>
          <Link to='/create'>
            <button className = 'primary-button' id = 'create-button'>create deck or concept list</button>
          </Link>
        </div>

        <div>
          <DeckList match={this.props.match} />
          <ConceptListList match={this.props.match} />
        </div>

      </div>
    )
  }
}

export default Dashboard;