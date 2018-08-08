import React from 'react';
import { getDeck, getUserProfileInfo, createCard, deleteCard, updateCard } from '../utils/api';
import firebase from '../utils/firebase';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from '../routes/routes';
import TextareaAutosize from 'react-autosize-textarea';
import { BigLoading } from './Loading';
import BackToDashboardButton from './BackToDashboardButton';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      frontChangeValue: props.front.slice(0),
      backChangeValue: props.back.slice(0)
    }

    this.handleUpdateCard = this.handleUpdateCard.bind(this);
    this.handleFrontChange = this.handleFrontChange.bind(this);
    this.handleBackChange = this.handleBackChange.bind(this);
  }

  handleUpdateCard() {
    const { doUpdateCard, id } = this.props;
    const { frontChangeValue, backChangeValue } = this.state;
    doUpdateCard(id, frontChangeValue, backChangeValue);
    this.setState(() => ({isUpdate: false}))
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
                        <button className = 'modify-stuff editing' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>cancel</button>
                      </span>     
                    : <span className = 'edit-button'>
                        <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>edit</button>
                      </span>
                  }
                  <span className = 'modify-stuff' id = 'line'>&nbsp;|&nbsp;</span>
                  <button className = 'modify-stuff delete-button' onClick={() => {handleDeleteCard(id)}}>delete</button>
                </div>
          }
        </div>
      </div>
      
    )
  }
}

Card.propTypes = {
  userIsOwner: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  back: PropTypes.string.isRequired,
  doUpdateCard: PropTypes.func.isRequired
}


function DeckTitle(props) {
  const { deckName, creatorName } = props;
  return (
    <div>
      <p className = 'deck-title edit-title'>{deckName}</p>
      <div className = 'inline-display center-subtitle'>
        <p className = 'small-caption'>created by {creatorName} | </p>
        <button className = 'small-caption change-title'> &nbsp;change deck title </button>
      </div>
    </div>
  )
}

DeckTitle.propTypes = {
  deckName: PropTypes.string.isRequired,
  creatorName: PropTypes.string.isRequired
}

class AddCardForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addCardFrontName: '',
      addCardBackName: ''
    }

    this.handleAddCard = this.handleAddCard.bind(this);
    this.handleChangeAddCardFront = this.handleChangeAddCardFront.bind(this);
    this.handleChangeAddCardBack = this.handleChangeAddCardBack.bind(this);
  }

  handleAddCard(e) {
    e.preventDefault();
    const { addCardFrontName, addCardBackName } = this.state;
    const { callback, deckId } = this.props;
    const cardFront = addCardFrontName.trim();
    const cardBack = addCardBackName.trim();

    if (cardFront && cardBack) {
      createCard(cardFront, cardBack, deckId)
        .then(() => {
          if (callback) {
            callback();
          }
          this.setState(() => ({
            addCardBackName: '',
            addCardFrontName: ''
          }))
        })
        .catch((err) => {
          console.error(err);
        })
    } else {
      alert("'One of your inputs is empty. Check your inputs and try again.'");
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
                autoComplete='off'
                value={addCardFrontName}
                onChange={this.handleChangeAddCardFront} />
              <img className = 'switch-front-and-back' src = '../src/resources/flashcard-img/switch.png' />
              <TextareaAutosize
                placeholder='back information'
                className = 'flashcard-text'
                type='text'
                autoComplete='off'
                value={addCardBackName}
                onChange={this.handleChangeAddCardBack} />
              <button type='submit' className = 'add'>add</button>
            </div>
          </div>
        </form>
    )
  }
}

AddCardForm.propTypes = {
  callback: PropTypes.func,
  deckId: PropTypes.string.isRequired
}

class Deck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      deckName: '',
      cards: [],
      id: '',
      creatorName: '',
      userIsOwner: false,
      isLoading: true
    }

    this.handleDeleteCard = this.handleDeleteCard.bind(this);
    this.doUpdateCard = this.doUpdateCard.bind(this);
    this.updateDeck = this.updateDeck.bind(this);
    this.submitDelete = this.submitDelete.bind(this);
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
        id: id,
        creatorName: creatorName,
        userIsOwner: currentUser != null && creatorId === firebase.auth().currentUser.uid,
        cards: cards,
        isLoading: false
      }));
    } catch(err) {
      console.error(err);
    }
  }

  async handleDeleteCard(cardId) {
    try {
      await deleteCard(this.state.id, cardId);
    } catch(err) {
      console.log(err);
    }
    this.updateDeck();
  }

  doUpdateCard(cardId, front, back) {
    updateCard(this.state.id, cardId, front, back).then(() => {
      this.updateDeck();
    }).catch((err) => {
      console.log(err);
    })
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
                onClose()
              }}>yes</button>
            </div>
          </div>
        )
      }
    })
  }

  render() {
    const { isLoading, deckName, creatorName, id, cards, userIsOwner } = this.state;

    return isLoading
      ? <BigLoading />
      : (
          <div>
            <div className = 'deck-info'>
              <BackToDashboardButton />
              <DeckTitle
                creatorName={creatorName}
                deckName={deckName} />
            </div>

            <div className='soft-blue-background'>
            <div>
              <Link id = 'study-deck' to={`${routes.studyDeck}/${id}`}>
                <button className = 'primary-button'>study this deck</button>
              </Link>
            </div>

            {userIsOwner && <AddCardForm 
                              deckId={id}
                              callback={this.updateDeck} /> }
            
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

              <div className = 'inline-display center-subtitle'>
                <button 
                  className = 'red delete-deck'
                  onClick = {this.submitDelete}
                > 
                    delete this deck
                </button>
              </div>
            </div>
          </div>
        )
  }
}

export default Deck;