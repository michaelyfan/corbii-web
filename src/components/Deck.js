import React from 'react';
import { getDeck, getUserProfileInfo, createCard, updateCard, updateCurrentUserDeck, deleteDeckFromCurrentUser, deleteCard } from '../utils/api';
import firebase from '../utils/firebase';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from '../routes/routes';
import TextareaAutosize from 'react-autosize-textarea';
import { BigLoading } from './reusables/Loading';
import BackButton from './reusables/BackButton';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// image assets
import switchImg from '../resources/flashcard-img/switch.png';

class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      frontChangeValue: props.front.slice(0),
      backChangeValue: props.back.slice(0)
    };

    this.handleUpdateCard = this.handleUpdateCard.bind(this);
    this.handleFrontChange = this.handleFrontChange.bind(this);
    this.handleBackChange = this.handleBackChange.bind(this);
  }

  handleUpdateCard() {
    const { doUpdateCard, id } = this.props;
    const { frontChangeValue, backChangeValue } = this.state;
    doUpdateCard(id, frontChangeValue, backChangeValue);
    this.setState(() => ({isUpdate: false}));
  }

  handleFrontChange(e) {
    const value = e.target.value;
    this.setState(() => ({frontChangeValue: value}));
  }

  handleBackChange(e) {
    const value = e.target.value;
    this.setState(() => ({backChangeValue: value}));
  }

  render() {
    const { id, front, back, handleDeleteCard } = this.props;

    return (
      <div className='flashcard'>
        <div className='flashcard' id = 'less-padding'>
          <div className='flashcard-text edit-card'>
            <p className='low'>front</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <TextareaAutosize 
                  type='text'
                  value={this.state.frontChangeValue}
                  maxLength='1000'
                  onChange={this.handleFrontChange}
                  className = 'update-card' />
                : <p className = 'editable-card'>{front}</p>
            }
          </div>
          <div className = 'flashcard-text edit-card'>
            <p className='low'>back</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <TextareaAutosize 
                  type='text'
                  maxLength='1000'
                  value={this.state.backChangeValue}
                  onChange={this.handleBackChange} 
                  className = 'update-card'/>
                : <p className = 'editable-card'>{back}</p>
            }
          </div>
        </div>


        <div className='side-menu'>
          { 
            this.props.userIsOwner
              && <div>
                { this.state.isUpdate 
                  ? <span className = 'edit-options'>
                    <button className = 'modify-stuff editing' onClick={this.handleUpdateCard}>update</button>
                    <button className = 'modify-stuff editing' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}));}}>cancel</button>
                  </span>     
                  : <span className = 'edit-button'>
                    <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}));}}>edit</button>
                  </span>
                }
                <span className = 'modify-stuff' id = 'line'>&nbsp;|&nbsp;</span>
                <button className = 'modify-stuff delete-button' onClick={() => {handleDeleteCard(id);}}>delete</button>
              </div>
          }
        </div>
      </div>
    );
  }
}

class DeckTitle extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      originalDeckName: props.deckName.slice(0),
      newDeckName: props.deckName.slice(0)
    };

    this.handleToggleUpdate = this.handleToggleUpdate.bind(this);
    this.handleUpdateDeck = this.handleUpdateDeck.bind(this);
    this.handleChangeNewDeckName = this.handleChangeNewDeckName.bind(this);
  }

  handleChangeNewDeckName(e) {
    const value = e.target.value;
    this.setState(() => ({
      newDeckName: value
    }));
  }

  handleToggleUpdate() {
    this.setState((prevState) => ({
      isUpdate: !prevState.isUpdate
    }));
  }

  handleUpdateDeck() {
    updateCurrentUserDeck(this.props.deckId, this.state.newDeckName).then(() => {
      this.setState((prevState) =>({
        originalDeckName: prevState.newDeckName,
        isUpdate: false
      }));
    }).catch((err) => {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      console.log(err);
    });
  }

  render() {
    const { isUpdate, originalDeckName, newDeckName } = this.state;
    const { creatorName, userIsOwner, numberOfCards } = this.props;
    return (
      <div>
        {isUpdate
          ? <input type='text'
            maxLength='150'
            className = 'deck-title'
            value = {newDeckName}
            onChange = {this.handleChangeNewDeckName}
            placeholder = 'title your deck here' 
          />
          : <p className = 'deck-title edit-title'>{originalDeckName}</p>}
        <div className = 'inline-display center-subtitle'>
          <p className = 'small-caption'>created by {creatorName} | 
            {numberOfCards} {numberOfCards === 1 ? 'card' : 'cards'} 
            {userIsOwner && <span>|</span>}</p>
          {userIsOwner && (
            isUpdate
              ? <span>
                <button onClick={this.handleUpdateDeck} className = 'small-caption change-title'>&nbsp;update</button>
                <button onClick={this.handleToggleUpdate} className = 'small-caption change-title'>&nbsp;cancel</button>
              </span>
              : <button onClick={this.handleToggleUpdate} className = 'small-caption change-title'>&nbsp;change deck title</button>
          )}
        </div>
      </div>
    );
  }
}

class AddCardForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addCardFrontName: '',
      addCardBackName: ''
    };

    this.handleAddCard = this.handleAddCard.bind(this);
    this.handleChangeAddCardFront = this.handleChangeAddCardFront.bind(this);
    this.handleChangeAddCardBack = this.handleChangeAddCardBack.bind(this);
    this.handleSwitch = this.handleSwitch.bind(this);
  }

  handleAddCard(e) {
    e.preventDefault();
    const { addCardFrontName, addCardBackName } = this.state;
    const { updateDeck, deckId } = this.props;
    const cardFront = addCardFrontName.trim();
    const cardBack = addCardBackName.trim();

    if (cardFront && cardBack) {
      createCard(cardFront, cardBack, deckId)
        .then(() => {
          this.setState(() => ({
            addCardBackName: '',
            addCardFrontName: ''
          }), () => {
            updateDeck();
          });
        })
        .catch((err) => {
          console.error(err);
          alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
        });
    } else {
      alert('One of your inputs is empty. Check your inputs and try again.');
    }
  }

  handleChangeAddCardFront(e) {
    e.persist();
    this.setState(() => ({
      addCardFrontName: e.target.value
    }));
  }

  handleChangeAddCardBack(e) {
    e.persist();
    this.setState(() => ({
      addCardBackName: e.target.value
    }));
  }

  handleSwitch() {
    this.setState((prevState) => ({
      addCardFrontName: prevState.addCardBackName,
      addCardBackName: prevState.addCardFrontName
    }));
  }

  render() {
    const { addCardFrontName, addCardBackName } = this.state;
    return (
      <form onSubmit={this.handleAddCard}>
        <p id = 'add-a-card'>add a card:</p>
        <div className = 'needs-padding'>
          <div className = 'flashcard add-card'>
            <TextareaAutosize
              placeholder='front information'
              className = 'flashcard-text'
              type='text'
              maxLength='1000'
              autoComplete='off'
              value={addCardFrontName}
              onChange={this.handleChangeAddCardFront} />
            <img className = 'switch-front-and-back'
              style={{cursor: 'pointer'}}
              src = {switchImg}
              onClick={this.handleSwitch} />
            <TextareaAutosize
              placeholder='back information'
              maxLength='1000'
              className = 'flashcard-text'
              type='text'
              autoComplete='off'
              value={addCardBackName}
              onChange={this.handleChangeAddCardBack} />
            <button type='submit' className = 'add'>add</button>
          </div>
        </div>
      </form>
    );
  }
}

class Deck extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      deckName: '',
      cards: [],
      creatorName: '',
      userIsOwner: false,
      isLoading: true,
    };

    this.handleDeleteCard = this.handleDeleteCard.bind(this);
    this.doUpdateCard = this.doUpdateCard.bind(this);
    this.updateDeck = this.updateDeck.bind(this);
    this.submitDelete = this.submitDelete.bind(this);
    this.handleDeleteDeck = this.handleDeleteDeck.bind(this);
  }

  componentDidMount() {
    this.updateDeck();
  }

  async updateDeck() {
    const { id } = this.props.match.params;

    try {
      let deck = await getDeck(id);
      const { deckName, creatorId, cards } = deck;
      let profileInfo = await getUserProfileInfo(creatorId);
      let creatorName = profileInfo.data().name;
      const currentUser = firebase.auth().currentUser;

      this.setState(() => ({
        deckName: deckName,
        creatorName: creatorName,
        userIsOwner: currentUser != null && creatorId === currentUser.uid,
        cards: cards,
        isLoading: false,
      }));
    } catch(err) {
      if (err.code === 'permission-denied') {
        this.props.history.push(routes.denied.base);
      } else {
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
        console.error(err);
      }
    }
  }

  async handleDeleteCard(cardId) {
    const { id } = this.props.match.params;
    try {
      await deleteCard(id, cardId);
    } catch(err) {
      console.log(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    }
    this.updateDeck();
  }

  doUpdateCard(cardId, front, back) {
    const { id } = this.props.match.params;
    updateCard(id, cardId, front, back).then(() => {
      this.updateDeck();
    }).catch((err) => {
      console.log(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }

  handleDeleteDeck() {
    const { id } = this.props.match.params;

    this.setState(() => ({
      isLoading: true
    }), () => {
      deleteDeckFromCurrentUser(id).then(() => {
        this.props.history.push(routes.dashboard.base);
      }).catch((err) => {
        console.log(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      });
    });
  }

  submitDelete() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui'>
            <h1 className = 'delete-deck-confirm'>are you sure you want to delete this deck?</h1>
            <h1 className = 'delete-deck-confirm' id = 'small-confirm'>this action cannot be undone.</h1>
            <div className = 'inline-display center-subtitle'>
              <button className = 'no-button'onClick={onClose}>no</button>
              <button className = 'yes-button' onClick={() => {
                this.handleDeleteDeck();
                onClose();
              }}>yes</button>
            </div>
          </div>
        );
      }
    });
  }

  render() {
    const { isLoading, deckName, creatorName, cards, userIsOwner } = this.state;
    const { id } = this.props.match.params;
    let fromSearch;
    let searchTerm;
    if (this.props.location.state) {
      ({ fromSearch, searchTerm } = this.props.location.state);
    }
    const numberOfCards = cards.length;

    // determine back button to render
    let backButton;
    if (fromSearch) {
      backButton = <BackButton
        redirectTo={routes.search.base}
        destination='search'
        search={routes.search.getQueryString('decks', searchTerm) }
      />;
    } else {
      backButton = <BackButton redirectTo={routes.dashboard.base} destination='dashboard' />;
    }

    return isLoading
      ? <BigLoading />
      : (
        <div id='deck-content-wrapper'>
          <div className = 'deck-info'>
            {backButton}
            <DeckTitle
              userIsOwner={userIsOwner}
              creatorName={creatorName}
              deckName={deckName}
              numberOfCards={numberOfCards}
              deckId={id} />
          </div>

          <div className='soft-blue-background cards-wrapper'>
            <Link id='study-deck' to={routes.study.getDeckRoute(id)}>
              <button className='primary-button'>study this deck</button>
            </Link>
            { userIsOwner && <AddCardForm deckId={id} updateDeck={this.updateDeck} /> }

            {cards.map((card) => 
              <Card 
                userIsOwner={userIsOwner}
                id={card.id} 
                front={card.front} 
                back={card.back} 
                doUpdateCard={this.doUpdateCard}
                handleDeleteCard={this.handleDeleteCard} 
                key={card.id} />
            )}

            { userIsOwner
            && <div className = 'inline-display center-subtitle'>
              <button className = 'red delete-deck' onClick = {this.submitDelete}> 
                delete this deck
              </button>
            </div>
            }
          </div>
        </div>
      );
  }
}

export default Deck;

Deck.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      searchTerm: PropTypes.string,
      fromSearch: PropTypes.bool
    }),
    pathname: PropTypes.string.isRequired
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
AddCardForm.propTypes = {
  updateDeck: PropTypes.func.isRequired,
  deckId: PropTypes.string.isRequired
};
Card.propTypes = {
  userIsOwner: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  back: PropTypes.string.isRequired,
  doUpdateCard: PropTypes.func.isRequired,
  handleDeleteCard: PropTypes.func.isRequired,
};
DeckTitle.propTypes = {
  deckName: PropTypes.string.isRequired,
  creatorName: PropTypes.string.isRequired,
  deckId: PropTypes.string.isRequired,
  userIsOwner: PropTypes.bool.isRequired,
  numberOfCards: PropTypes.number.isRequired,
};