import React from 'react';
import { getCurrentUserDecks, createDeckCurrentUser, deleteDeckFromCurrentUser, updateCurrentUserDeck } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'

class DeckRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      newDeckName: props.name.slice(0)
    };

    this.handleUpdateDeck = this.handleUpdateDeck.bind(this);
    this.handleChangeNewDeckName = this.handleChangeNewDeckName.bind(this);
    this.handleDeleteDeck = this.handleDeleteDeck.bind(this);
  }

  handleChangeNewDeckName(e) {
    const value = e.target.value;
    this.setState(() => ({
      newDeckName: value
    }));
  }

  handleUpdateDeck() {
    updateCurrentUserDeck(this.props.id, this.state.newDeckName).then(() => {
      this.setState(() => ({
        statusText: 'Deck successfully updated!'
      }))
      this.props.getDecks();
    }).catch((err) => {
      console.log(err);
      this.setState(() => ({
        statusText: 'There was an error. Check the console and restart the app.'
      }))
    })
    this.setState(() => ({isUpdate: false}));
  }

  handleDeleteDeck(deckId) {
    deleteDeckFromCurrentUser(deckId).then(() => {
      this.setState(() => ({statusText: 'Deck successfully deleted.'}))
      this.props.getDecks();
    }).catch((err) => {
      console.log(err);
      this.setState(() => ({
        statusText: 'There was an error. See the console and refresh the page.'
      }))
    })
  }

  render() {
    const { name, id, match } = this.props;

    return (
      <div className='deck-row'>
        {
          this.state.isUpdate
            ? <div>
                <form onSubmit={this.handleUpdateDeck}>
                  <input type='text' value={this.state.newDeckName} onChange={this.handleChangeNewDeckName} />
                  <button type='submit'>Update</button>
                </form>
                <button onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>Cancel</button>
              </div>
            : <p>{name} -- {id}</p>
        }
        <Link 
          to={{
            pathname: `${match.url}/view`,
            search: `?d=${id}`
          }}>
          <button>
            View
          </button>
        </Link>
        <button onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>Change name</button>
        <button onClick={() => {this.handleDeleteDeck(id)}}>Delete</button>
      </div>
    )
  }
}

DeckRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
}

class DeckList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newDeckName: '',
      statusText: '',
      deckArr: []
    };

    this.getDecks = this.getDecks.bind(this);
    this.handleAddDeck = this.handleAddDeck.bind(this);
    this.handleChangeNewDeckName = this.handleChangeNewDeckName.bind(this);
  }

  componentDidMount() {
    if (this.props.signedIn) {
      this.getDecks();
    }
  }

  getDecks() {
    getCurrentUserDecks().then((decks) => {
      this.setState(() => ({
        deckArr: decks
      }))
    }).catch((err) => {
      console.error(err);
    })
  }

  clearDecks() {
    this.setState(() => ({
      deckArr: []
    }))
  }

  handleAddDeck(e) {
    e.preventDefault();

    const deckName = this.state.newDeckName.trim();
    if (deckName) {
      createDeckCurrentUser(deckName).then(() => {
        this.getDecks();
          this.setState(() => ({statusText: 'Deck successfully added!'}));
        }).catch((err) => {
          console.log(err);
          this.setState(() => ({
            statusText: 'There was an error. See the console and refresh the page.'
          }))
        })
    } else {
      this.setState(() => ({
        statusText: 'Deck name cannot be empty.'
      }));
    }
  }

  handleChangeNewDeckName(e) {
    e.persist();
    this.setState(() => ({
      newDeckName: e.target.value
    }));
  }


  render() {

    return (
      <div>
        {this.state.statusText}
        {
          this.props.signedIn
            ? <div>
                <form onSubmit={this.handleAddDeck}>
                  <input 
                    placeholder='Add a deck...'
                    type='text' 
                    autoComplete='off' 
                    value={this.state.newDeckName}
                    onChange={this.handleChangeNewDeckName} />
                  <button type='submit'>Add Deck</button>
                </form>
                <p>Your decks:</p>
                {this.state.deckArr.map((deck) => (
                  <DeckRow 
                    name={deck.name} 
                    id={deck.id} 
                    key={deck.id} 
                    match={this.props.match}
                    getDecks={this.getDecks} />
                ))}
              </div>
            : <div>
                <h3>Sign in to view your decks.</h3>
                <Link to='/signin'>Sign in</Link>
              </div>
            
        }
        
        
      </div>
      
    )
  }
}

export default DeckList;