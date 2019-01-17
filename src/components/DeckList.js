import React from 'react';
import { getCurrentUserDecks } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import routes from '../routes/routes';
import { Loading, BigLoading } from './reusables/Loading';

function DeckRow(props) {
  const { name, id } = props;

  return (
    <div className='deck-row'>
      <Link to={`${routes.viewDeck}/${id}`}>
        <button className = 'stuff-title'>{name}</button>
      </Link>
    </div>
  )
}

DeckRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
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
      }))
    }).catch((err) => {
      console.error(err);
    })
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
      
    )
  }
}

export default DeckList;