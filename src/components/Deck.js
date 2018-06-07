import React from 'react';
import { getDeck, addCard, deleteCard } from '../utils/api';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    }

    this.handleEditCard = this.handleEditCard.bind(this);
  }

  handleEditCard() {
    console.log('Edit card');
  }

  render() {
    const { id, front, back, handleDeleteCard } = this.props;

    return (
      <div className='card-wrapper'>
        <div className='card'>
          <div className='card-front'>
            <p className='low'>Front</p>
            <p>{front}</p>
          </div>
          <div>
            <p className='low'>Back</p>
            <p>{back}</p>
          </div>
        </div>
        <button onClick={this.handleEditCard}>Edit</button>
        <button onClick={() => {handleDeleteCard(id)}}>Delete</button>
      </div>
      
    )
  }
}

Card.propTypes = {
  id: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  back: PropTypes.string.isRequired
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
  }

  async componentDidMount() {
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
    await deleteCard(this.state.id, cardId);
    this.updateDeck();
  }

  handleAddCard(e) {
    e.preventDefault();
    const cardFront = this.state.addCardFrontName.trim();
    const cardBack = this.state.addCardBackName.trim();

    if (cardFront && cardBack) {

      addCard(cardFront, cardBack, this.state.id, () => {
        this.updateDeck();
        this.setState(() => ({
          statusText: 'Card successfully added!'
        }));
      }, () => {
        this.setState(() => ({
          statusText: 'There was an error. See the console and refresh the page.'
        }));
      });

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
        {this.state.cards.map((card) => 
          <Card 
            id={card.id} 
            front={card.front} 
            back={card.back} 
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