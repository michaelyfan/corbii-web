import React from 'react';
import { getDeck, addCard, deleteCard, updateCard } from '../utils/api';
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
      <div className='card-wrapper'>
        <div className='card'>
          <div className='card-front'>
            <p className='low'>Front</p>
            {
              this.state.isUpdate
                ? <input type='text' value={this.state.frontChangeValue} onChange={this.handleFrontChange} />
                : <p>{front}</p>
            }
          </div>
          <div>
            <p className='low'>Back</p>
            {
              this.state.isUpdate
                ? <input type='text' value={this.state.backChangeValue} onChange={this.handleBackChange} />
                : <p>{back}</p>
            }
          </div>
        </div>

        {
          this.state.isUpdate
            ? <span>
                <button onClick={this.handleUpdateCard}>Update</button>
                <button onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>Cancel</button>
              </span>            
            : <button onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>Edit</button>
        }
        <button onClick={() => {handleDeleteCard(id)}}>Delete</button>
      </div>
      
    )
  }
}

Card.propTypes = {
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
    const { d } = queryString.parse(this.props.location.search);

    const deck = await getDeck(d);
    this.setState(() => ({
      deckName: deck.deckName,
      id: d,
      cards: deck.cards
    }));
  }

  async handleDeleteCard(cardId) {
    try {
      await deleteCard(this.state.id, cardId);
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
      addCard(cardFront, cardBack, this.state.id)
        .then(() => {
          this.updateDeck();
          this.setState(() => ({
            statusText: 'Card successfully added!'
          }))
        })
        .catch((err) => {
          console.log(err);
          this.setState(() => {
            statusText: 'There was an error. Check the console and refresh the app.'
          })
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
      }))
    })
  }

  render() {
    return (
      <div>
        <h1>{this.state.deckName}</h1>
        {this.state.statusText}
        <br />
        <Link to='/decks'>
          <button>Back to decks</button>
        </Link>
        <form onSubmit={this.handleAddCard}>
          <span>Add a card:</span>
          <input
            placeholder='Front...'
            type='text'
            autoComplete='off'
            value={this.state.addCardFrontName}
            onChange={this.handleChangeAddCardFront} />
          <input
            placeholder='Back...'
            type='text'
            autoComplete='off'
            value={this.state.addCardBackName}
            onChange={this.handleChangeAddCardBack} />
          <button type='submit'>Add</button>
        </form>
        <button onClick={() => {alert('Coming soon!')}}>
          Study
        </button>
        {this.state.cards.map((card) => 
          <Card 
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

Deck.propTypes = {
  uid: PropTypes.string.isRequired
}

export default Deck;