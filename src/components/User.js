import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BackButton from './reusables/BackButton';
import { getUserAll, getProfilePic } from '../utils/api';
import routes from '../routes/routes';

function DeckMiniView(props) {
  const { id, name } = props;
  return (
    <div className='deck-mini-view'> 
      <Link to={routes.viewDeck.getRoute(id)}>
        <h3 className = 'profile-decklist'>{name}</h3>
      </Link>  
    </div>
  );
}

class User extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      decks: [],
      profilePic: null,
    };
  }

  componentDidMount() {
    this.updateUser();
    console.log(this.props.location);
  }

  async updateUser() {
    const { id } = this.props.match.params;
    let newState;
    try {
      const user = await getUserAll(id);
      newState = {
        name: user.name,
        decks: user.decks,
        id: user.id,
      };
    } catch(err) {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      return console.error(err);
    }

    try {
      newState.profilePic = await getProfilePic(id);
    } catch (err) {
      console.error('Error encountered when retrieving profile pic: ', err);
    }

    this.setState(() => newState);
  }

  render() {
    const { location } = this.props;

    return (
      <div>
        <BackButton
          redirectTo={routes.search.base}
          destination='search'
          search={location.state && location.state.fromSearch
            ? routes.search.getQueryString('users', location.state.searchTerm)
            : routes.search.getQueryString('users', '') }
        />
        {this.state.profilePic && <img className='profile-img' src={this.state.profilePic} /> }
        <h2 className = 'username'>{this.state.name}</h2>
        {this.state.decks.map((deck) => 
          <DeckMiniView 
            key={deck.id}
            id={deck.id}
            name={deck.name} />
        )}
      </div>
    );
  }
}

export default User;

User.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      searchTerm: PropTypes.string,
      fromSearch: PropTypes.bool
    })
  })
};
DeckMiniView.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};