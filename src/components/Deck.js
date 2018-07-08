import React from 'react';
import { getDeck, createCard, deleteCard, updateCard } from '../utils/api';
import firebase from '../utils/firebase';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

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
        <div className='flashcard'>
          <div className='flashcard-text edit-card'>
            <p className='low'>front</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <textarea 
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
                ? <textarea 
                    type='text'
                    value={this.state.backChangeValue}
                    onChange={this.handleBackChange} 
                    className = 'update-card'/>
                : <p className = 'editable-card'>{back}</p>
            }
          </div>
        </div>

        { 
          this.props.userIsOwner
            ? this.state.isUpdate
                ? <span className = 'edit-options'>
                    <button className = 'modify-stuff editing' onClick={this.handleUpdateCard}>update</button>
                    <button className = 'modify-stuff editing' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>cancel</button>
                  </span>            
                : <span className = 'edit-button'>
                    <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>edit</button>
                  </span>
            : null
        }
        <span className = 'modify-stuff' id = 'line'>&nbsp; | </span>
        { this.props.userIsOwner && <button className = 'modify-stuff delete-button' onClick={() => {handleDeleteCard(id)}}>delete</button>}
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

class Deck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      deckName: '',
      cards: [],
      id: '',
      userIsOwner: false,
      addCardFrontName: '',
      addCardBackName: '',
      statusText: ''
    }

    this.handleAddCard = this.handleAddCard.bind(this);
    this.handleDeleteCard = this.handleDeleteCard.bind(this);
    this.handleChangeAddCardFront = this.handleChangeAddCardFront.bind(this);
    this.handleChangeAddCardBack = this.handleChangeAddCardBack.bind(this);
    this.doUpdateCard = this.doUpdateCard.bind(this);
  }

  componentDidMount() {
    this.updateDeck();
  }

  async updateDeck() {
    const { id } = this.props.match.params;
    let deck;
    try {
      deck = await getDeck(id);
      const currentUser = firebase.auth().currentUser;
      this.setState(() => ({
        deckName: deck.deckName,
        id: id,
        userIsOwner: currentUser != null && deck.creatorId === firebase.auth().currentUser.uid,
        cards: deck.cards
      }));
    } catch(err) {
      console.error(err);
    }
  }

  async handleDeleteCard(cardId) {
    try {
      await deleteCard(this.state.id, cardId);
      this.setState(() => ({
        statusText: 'Card successfully deleted.'
      }))
    } catch(err) {
      console.log(err);
    }
    
    this.updateDeck();
  }

  handleAddCard(e) {
    e.preventDefault();
    const cardFront = this.state.addCardFrontName.trim();
    const cardBack = this.state.addCardBackName.trim();

    if (cardFront && cardBack) {
      createCard(cardFront, cardBack, this.state.id)
        .then(() => {
          this.updateDeck();
          this.setState(() => ({
            statusText: 'Card successfully added!'
          }))
        })
        .catch((err) => {
          this.setState(() => ({
            statusText: 'There was an error. Check the console and refresh the app.'
          }))
          console.error(err);
        })

    } else {
      this.setState(() => ({
        statusText: 'One of your inputs is empty. Check your inputs and try again.'
      }))
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

  doUpdateCard(cardId, front, back) {
    updateCard(this.state.id, cardId, front, back).then(() => {
      this.setState(() => ({
        statusText: 'Card successfully updated!',
      }));
      this.updateDeck();
    }).catch((err) => {
      console.log(err);
      this.setState(() => ({
        statusText: 'There was an error. Check the console and refresh the app.'
      }));
    })
  }

  render() {
    return (
      <div>
        <div>
          <Link to='/dashboard'>
            <button className = 'back-to-deck'>back to dashboard</button>
          </Link>
          <p className = 'deck-title edit-title'>{this.state.deckName}</p>
          <p className = 'small-caption'>deck title</p>
          <div className = 'hr'><hr /></div>
        </div>

        {
          this.state.userIsOwner
            ? <form onSubmit={this.handleAddCard}>
                <div>
                  <p id = 'add-a-card'>add a card:</p>
                  <div className = 'flashcard add-card'>
                    <textarea
                      placeholder='front information'
                      className = 'flashcard-text'
                      type='text'
                      autoComplete='off'
                      value={this.state.addCardFrontName}
                      onChange={this.handleChangeAddCardFront} />
                    <img className = 'switch-front-and-back' src = '../src/resources/flashcard-img/switch.png' />
                    <textarea
                      placeholder='back information'
                      className = 'flashcard-text'
                      type='text'
                      autoComplete='off'
                      value={this.state.addCardBackName}
                      onChange={this.handleChangeAddCardBack} />
                    <button type='submit' className = 'add'>add</button>
                  </div>
                </div>
              </form>
            : null
        }
         <div>
          <Link id = 'study-deck' to={`/study/deck/${this.state.id}`}>
            <button className = 'primary-button'>study this deck</button>
          </Link>
        </div>

        {this.state.cards.map((card) => 
          <Card 
            userIsOwner={this.state.userIsOwner}
            id={card.id} 
            front={card.front} 
            back={card.back} 
            doUpdateCard={this.doUpdateCard}
            handleDeleteCard={this.handleDeleteCard} 
            key={card.id} />
        )}
      </div>
    )
  }
}

export default Deck;