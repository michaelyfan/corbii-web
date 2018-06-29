import React from 'react';
import { getCurrentUserDecks, deleteDeckFromCurrentUser, updateCurrentUserDeck } from '../utils/api';
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
            : <Link 
                to={{
                  pathname: `/decks`,
                  search: `?d=${id}`
                }}>
                <button className = 'stuff-title'>{name}</button>
              </Link>
        }

        <div class = 'stuff-menu'>
          <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>&nbsp; change name</button>
          <span className = 'modify-stuff'>&nbsp; | </span>
          <button className = 'modify-stuff' onClick={() => {this.handleDeleteDeck(id)}}>&nbsp; delete</button>
        </div>
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
      statusText: '',
      deckArr: []
    };

    this.getDecks = this.getDecks.bind(this);
  }

  componentDidMount() {
    if (this.props.signedIn) {
      this.getDecks();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.signedIn === true && this.props.signedIn != prevProps.signedIn) {
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

  render() {

    return (
      <div>
        {this.state.statusText}
        {
          this.props.signedIn
            ? <div>
                <div className = 'hr'><hr /></div>
                <h3 className = 'your-stuff'>your decks</h3>
                <div className = 'hr'><hr /></div>
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

DeckList.propTypes = {
  signedIn: PropTypes.bool.isRequired
}

export default DeckList;