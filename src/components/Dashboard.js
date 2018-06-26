import React from 'react';
import PropTypes from 'prop-types';
import DeckList from './DeckList';
import ConceptListList from './ConceptListList';
import { Link } from 'react-router-dom';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);


  }

  render() {
    return (
      <div>
        <h3>Welcome to your dashboard.</h3>
        <Link to='/create'>
          <button>Create deck or concept list</button>
        </Link>
        <DeckList signedIn={this.props.signedIn} match={this.props.match} />
        <ConceptListList signedIn={this.props.signedIn} match={this.props.match} />
      </div>
    )
  }
}

Dashboard.propTypes = {
  signedIn: PropTypes.bool.isRequired
}

export default Dashboard;