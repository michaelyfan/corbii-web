import React from 'react';
import PropTypes from 'prop-types';
import DeckList from './DeckList';
import ConceptListList from './ConceptListList';
import { Link } from 'react-router-dom';
import firebase from '../utils/firebase';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '' 
    }
  }

  componentDidMount() {
    if (this.props.signedIn) {
      this.setState(() => ({name: firebase.auth().currentUser.displayName}));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.signedIn === true && this.props.signedIn != prevProps.signedIn) {
      this.setState(() => ({name: firebase.auth().currentUser.displayName}));
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
          <DeckList signedIn={this.props.signedIn} match={this.props.match} />
          <ConceptListList signedIn={this.props.signedIn} match={this.props.match} />
        </div>
      </div>
    )
  }
}

Dashboard.propTypes = {
  signedIn: PropTypes.bool.isRequired
}

export default Dashboard;