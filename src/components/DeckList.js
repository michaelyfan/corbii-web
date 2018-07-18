import React from 'react';
import { getCurrentUserDecks, deleteDeckFromCurrentUser, updateCurrentUserDeck } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import routes from '../routes/routes';
import { Loading, BigLoading } from './Loading';

class DeckRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      newDeckName: props.name.slice(0),
      isLoading: false
    };

    this.handleUpdateDeck = this.handleUpdateDeck.bind(this);
    this.handleChangeNewDeckName = this.handleChangeNewDeckName.bind(this);
    this.handleDeleteDeck = this.handleDeleteDeck.bind(this);
    this.handleToggleUpdate = this.handleToggleUpdate.bind(this);
  }

  handleChangeNewDeckName(e) {
    const value = e.target.value;
    this.setState(() => ({
      newDeckName: value
    }));
  }

  handleUpdateDeck() {
    this.setState(() => ({
      isLoading: true
    }), () => {
      updateCurrentUserDeck(this.props.id, this.state.newDeckName).then(() => {
        this.props.getDecks().then(() => {
          this.setState(() => ({
            isUpdate: false,
            isLoading: false
          }))
        });
      }).catch((err) => {
        console.log(err);
        alert(err);
      })
    })
    
  }

  handleDeleteDeck(deckId) {
    this.setState(() => ({
      isLoading: true
    }), () => {
      deleteDeckFromCurrentUser(deckId).then(() => {
        this.props.getDecks();
      }).catch((err) => {
        console.log(err);
        alert(err);
      })
    })
  }

  handleToggleUpdate() {
    this.setState((prevState) => ({
      isUpdate: !prevState.isUpdate
    })) 
  }

  render() {
    const { name, id } = this.props;
    const { isLoading, isUpdate, newDeckName } = this.state;

    return (
      <div className='deck-row'>
        {
          isLoading
            ? <Loading />
            : isUpdate
              ? <div>
                  <form id = 'next-line' onSubmit={this.handleUpdateDeck}>
                    <input 
                      maxLength='150'
                      className = 'stuff-title change-title'
                      type='text' 
                      value={newDeckName} 
                      onChange={this.handleChangeNewDeckName} />
                    <br />
                    <button type='submit' className = 'modify-stuff needs-padding'>update</button>
                    <span className = 'modify-stuff'>&nbsp; | </span>
                    <button className = 'modify-stuff' onClick={this.handleToggleUpdate}>cancel</button>
                  </form> 
                </div>
              : <div>
                  <Link to={`${routes.viewDeckRoute}/${id}`}>
                    <button className = 'stuff-title'>{name}</button>
                  </Link>
                  <div className = 'stuff-menu'>
                    <button className = 'modify-stuff buffer' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>change name</button>
                    <span className = 'modify-stuff'>&nbsp; | </span>
                    <button className = 'modify-stuff' onClick={() => {this.handleDeleteDeck(id)}}>&nbsp; delete</button>
                  </div>
                </div>
          
        }
      </div>
    )
  }
}

DeckRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  getDecks: PropTypes.func.isRequired
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
                        id={deck.id} 
                        getDecks={this.getDecks} />
                    ))}
        </div>
        
        
      </div>
      
    )
  }
}

export default DeckList;