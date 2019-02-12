import React from 'react';
import { getCurrentUserDecks } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';

function DeckRow(props) {
  const { name, id } = props;

  return (
    <div className='deck-row'>
      <Link to={routes.viewDeck.getRoute(id)}>
        <button className = 'stuff-title'>{name}</button>
      </Link>
    </div>
  );
}

class DeckList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deckArr: []
    };

    this.getDecks = this.getDecks.bind(this);
  }

  componentDidMount() {
    this.getDecks();
  }

  getDecks() {
    return getCurrentUserDecks().then((decks) => {
      this.setState(() => ({
        deckArr: decks
      }));
    }).catch((err) => {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }
  
  render() {
    return (
      <div>
        <div>
          <h3 className = 'your-stuff'>your decks</h3>
          {this.state.deckArr.map((deck) => (
            <DeckRow 
              name={deck.name} 
              key={deck.id} 
              id={deck.id} />
          ))}
        </div>
      </div>
    );
  }
}

export default DeckList;

DeckRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};