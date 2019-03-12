import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BackButton from './reusables/BackButton';
import { getUserAll } from '../utils/api';
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
      profilePic: null
    };
  }

  componentDidMount() {
    this.updateDeck();
  }

  async updateDeck() {
    const { id } = this.props.match.params;
    let user;
    try {
      user = await getUserAll(id);
      this.setState(() => ({
        name: user.name,
        decks: user.decks,
        id: user.id,
        profilePic: user.photoURL
      }));

    } catch(err) {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    }
  }

  render() {
    return (
      <div>
        <BackButton redirectTo={routes.search.base} destination='search' />
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
  })
};
DeckMiniView.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};