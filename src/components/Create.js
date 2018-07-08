import React from 'react';
import PropTypes from 'prop-types';
import { createDeckCurrentUser, createConceptListCurrentUser } from '../utils/api';
import Profile from './Profile.js';

class CreateDeckCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Below is normally bad practice, but this use case is valid.
      front: props.initialFront,
      back: props.initialBack
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleChange(side, e) {
    const newValue = e.target.value;
    this.setState(() => ({
      [side]: newValue
    }));
  }

  handleSave() {
    this.props.save(this.props.id, this.state.front, this.state.back);
  }

  render() {
    return (
      <div className = 'flashcard'>
        <textarea type='text'
          className = 'flashcard-text'
          key='front'
          value={this.state.front}
          onChange={(e) => {this.handleChange('front', e)}}
          onBlur={this.handleSave}
          placeholder='front information' />
        <img className = 'switch-front-and-back' src = '../src/resources/flashcard-img/switch.png' />
        <textarea type='text'
          className = 'flashcard-text' 
          key='back'
          value={this.state.back}
          onChange={(e) => {this.handleChange('back', e)}}
          onBlur={this.handleSave}
          placeholder='back information' />

        <div className = 'side-menu'>
          <img className = 'side-options' src = '../src/resources/flashcard-img/up-arrow.png' />
          <img className = 'side-options' src = '../src/resources/flashcard-img/trash.png' />
          <img className = 'side-options' src = '../src/resources/flashcard-img/down-arrow.png' />
        </div>
      </div>
    )
  }
}

CreateDeckCard.propTypes = {
  initialFront: PropTypes.string.isRequired,
  initialBack: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  save: PropTypes.func.isRequired
}

class CreateConceptCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Below is normally bad practice, but this use case is valid.
      question: props.initialQuestion,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleChange(e) {
    e.persist();
    this.setState(() => ({
      question: e.target.value
    }));
  }

  handleSave() {
    this.props.save(this.props.id, this.state.question);
  }

  render() {
    return (
      <div className = 'flashcard'>
        <input type='text' 
          className = 'flashcard-text'
          id = 'concept-card'
          key='question'
          value={this.state.question}
          onChange={this.handleChange}
          onBlur={this.handleSave}
          placeholder='question or concept' />
      </div>
    )
  }
}

CreateConceptCard.propTypes = {
  initialQuestion: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  save: PropTypes.func.isRequired
}

class CreateDeck extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      count: 3,
      cards: [{
        front: '',
        back: '',
        id: 0
      },{
        front: '',
        back: '',
        id: 1
      },{
        front: '',
        back: '',
        id: 2
      }]
    }

    this.handleAddCard = this.handleAddCard.bind(this);
    this.save = this.save.bind(this);
  }

  

  handleAddCard() {
    this.setState((prevState) => {
      const cards = prevState.cards;
      cards.push({
        front: '',
        back: '',
        id: prevState.count
      });
      return {
        cards: cards,
        count: prevState.count + 1
      }
    });
  }

  save(cardId, newFront, newBack) {
    this.setState((prevState) => {

      const cards = prevState.cards;
      const newCards = prevState.cards.map((card) => {
        return card.id === cardId 
          ? {id: cardId, front: newFront, back: newBack} 
          : card
      });

      return {
        cards: newCards
      }
    })
  }

  render() {
    return (
      <div>
        <div>
          {this.state.cards.map((card) => 
            <CreateDeckCard  
              initialFront={card.front} 
              initialBack={card.back} 
              id={card.id} 
              key={card.id}
              save={this.save} />
          )};
          <div className = 'add-more-card'>
            <button 
              className = 'secondary-button'
              id = 'more-flashcard'
              onClick={this.handleAddCard}>
                add a card
            </button>
          </div>
          <div className = 'add-more-card'>
            <button
              onClick={() => {this.props.handleCreateDeck(this.state.cards)}}
              className = 'primary-button'
              id = 'finalize-deck'>
                create deck
            </button>
          </div>
        </div>
      </div>
    )
  }
}

class CreateList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      count: 1,
      concepts: [{
        question: '',
        answer: '',
        id: 0
      }]
    }

    this.handleAddConcept = this.handleAddConcept.bind(this);
    this.save = this.save.bind(this);
  }

  

  handleAddConcept() {
    this.setState((prevState) => {
      const concepts = prevState.concepts;
      concepts.push({
        question: '',
        answer: '',
        id: prevState.count
      });
      return {
        concepts: concepts,
        count: prevState.count + 1
      }
    });
  }

  save(conceptId, newQuestion) {
    this.setState((prevState) => {
      const concepts = prevState.concepts;
      const newConcepts = prevState.concepts.map((concept) => {
        return concept.id === conceptId 
          ? {id: conceptId, question: newQuestion} 
          : concept
      });

      return {
        concepts: newConcepts
      }
    })
  }

  render() {
    return (
      <div>
        <div>
          {this.state.concepts.map((concept) => 
            <CreateConceptCard  
              initialQuestion={concept.question} 
              id={concept.id} 
              key={concept.id}
              save={this.save} />
          )};
          <div className = 'add-more-card' id = 'add-concept'>
            <button 
              className = 'secondary-button'
              id = 'more-concept'
              onClick={this.handleAddConcept}>
                add a concept
            </button>
          </div>
          <div className = 'add-more-card'>
            <button
              onClick={() => {this.props.handleCreateList(this.state.concepts)}}
              className = 'primary-button'
              id = 'finalize-list'>
                create list
            </button>
          </div>
        </div>        
      </div>
    )
  }
}

class Create extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isList: false,
      title: '',
    }

    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleCreateList = this.handleCreateList.bind(this);
    this.handleCreateDeck = this.handleCreateDeck.bind(this);
  }

  handleChangeTitle(e) {
    e.persist();
    this.setState(() => ({
      title: e.target.value
    }))
  }

  handleCreateList(concepts) {
    createConceptListCurrentUser(this.state.title, concepts).then(() => {
      this.props.history.push('/dashboard');
    }).catch((err) => {
      this.setState(() => ({statusText: 'There was an error. Check the console and refresh the app.'}));
    });
  }

  handleCreateDeck(cards) {
    createDeckCurrentUser(this.state.title, cards).then(() => {
      this.props.history.push('/dashboard');
    }).catch((err) => {
      this.setState(() => ({statusText: 'There was an error. Check the console and refresh the app.'}));
    });
  }

  render() {
    return (
      <div>
        <div className = 'create-deck'>
          <input type='text'
            className = 'deck-title'
            onChange={this.handleChangeTitle}
            value={this.state.title}
            placeholder =
            { this.state.isList 
              ? 'title your list here'
              : 'title your deck here'
           }
          />

          <p className = 'small-caption' id = 'deck-subtitle'>
          { this.state.isList 
              ? 'concept list title'
              : 'deck title'
           } 
          </p>
          <div className = 'hr'><hr /></div>
        </div>

        <div className = 'button-wrapper'>
          <div className = 'create-buttons'>
            <button className = 'create-type' onClick={() => {this.setState(() => ({isList: false}))}}>create a study deck</button>
            <button className = 'create-type' onClick={() => {this.setState(() => ({isList: true}))}}>create a concept list</button>
            { this.state.isList 
              ? <CreateList handleCreateList={this.handleCreateList} />
              : <CreateDeck handleCreateDeck={this.handleCreateDeck} />
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Create;