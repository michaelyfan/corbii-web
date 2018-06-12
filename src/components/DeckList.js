import React from 'react';
import { addDeck, deleteDeck, updateDeck } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'

class DeckRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      updateDeckName: props.name.slice(0)
    };

    this.handleUpdateDeck = this.handleUpdateDeck.bind(this);
    this.handleUpdateDeckChange = this.handleUpdateDeckChange.bind(this);
  }

  handleUpdateDeckChange(e) {
    const value = e.target.value;
    this.setState(() => ({
      updateDeckName: value
    }));
  }

  handleUpdateDeck() {
    this.props.doUpdateDeck(this.props.id, this.state.updateDeckName);
    this.setState(() => ({isUpdate: false}));
  }

  render() {
    const { name, id, match, handleDeleteDeck } = this.props;

    return (
      <div className='deck-row'>
        {
          this.state.isUpdate
            ? <div>
                <form onSubmit={this.handleUpdateDeck}>
                  <input type='text' value={this.state.updateDeckName} onChange={this.handleUpdateDeckChange} />
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
        <button onClick={() => {handleDeleteDeck(id)}}>Delete</button>
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
      addDeckName: '',
      statusText: ''
    };

    this.doUpdateDeck = this.doUpdateDeck.bind(this);
    this.handleAddDeck = this.handleAddDeck.bind(this);
    this.handleChangeAddDeck = this.handleChangeAddDeck.bind(this);
    this.handleDeleteDeck = this.handleDeleteDeck.bind(this);
  }

  doUpdateDeck(deckId, newDeckName) {
    updateDeck(this.props.uid, deckId, newDeckName).then(() => {
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
  }

  handleAddDeck(e) {
    e.preventDefault();

    const deckName = this.state.addDeckName.trim();
    if (deckName) {
      addDeck(deckName, this.props.uid, this.props.name).then(() => {
        this.props.getDecks();
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

  handleChangeAddDeck(e) {
    e.persist();
    this.setState(() => ({
      addDeckName: e.target.value
    }));
  }

  handleDeleteDeck(deckId) {
    deleteDeck(this.props.uid, deckId).then(() => {
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

    return (
      <div>
        {this.state.statusText}
        <form onSubmit={this.handleAddDeck}>
          <input 
            placeholder='Add a deck...'
            type='text' 
            autoComplete='off' 
            value={this.state.addDeckName}
            onChange={this.handleChangeAddDeck} />
          <button type='submit'>Add Deck</button>
        </form>
        <p>Your decks:</p>
        {this.props.deckArr.map((deck) => (
          <DeckRow 
            name={deck.name} 
            id={deck.id} 
            key={deck.id} 
            match={this.props.match}
            doUpdateDeck={this.doUpdateDeck}
            handleDeleteDeck={this.handleDeleteDeck}
            setStatusText={(text) => {this.setState(() => ({statusText: text}))}} />
        ))}
      </div>
      
    )
  }
}

DeckList.propTypes = {
  uid: PropTypes.string.isRequired,
  deckArr: PropTypes.array.isRequired,
  getDecks: PropTypes.func.isRequired
}

export default DeckList;