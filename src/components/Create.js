import React from 'react';
import PropTypes from 'prop-types';
import { createDeckCurrentUser, createConceptListCurrentUser } from '../utils/api';

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
      <div>
        <input type='text' 
          key='front'
          value={this.state.front}
          onChange={(e) => {this.handleChange('front', e)}}
          onBlur={this.handleSave}
          placeholder='card front' />
        <input type='text' 
          key='back'
          value={this.state.back}
          onChange={(e) => {this.handleChange('back', e)}}
          onBlur={this.handleSave}
          placeholder='card back' />

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
      <div>
        <input type='text' 
          key='question'
          value={this.state.question}
          onChange={this.handleChange}
          onBlur={this.handleSave}
          placeholder='question' />

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
      count: 1,
      cards: [{
        front: '',
        back: '',
        id: 0
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
          <button onClick={this.handleAddCard}>Add a card</button>
          <button onClick={() => {this.props.handleCreateDeck(this.state.cards)}}>Create Deck</button>
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
          <button onClick={this.handleAddConcept}>Add a concept</button>
          <button onClick={() => {this.props.handleCreateList(this.state.concepts)}}>Create list</button>
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
      title: ''
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
        <input type='text'
               onChange={this.handleChangeTitle}
               value={this.state.title}
               placeholder='Deck/conceptlist title...' 
        />
        <button onClick={() => {this.setState(() => ({isList: false}))}}>I'm creating a deck</button>
        <button onClick={() => {this.setState(() => ({isList: true}))}}>I'm creating a concept list</button>
        { this.state.isList 
          ? <CreateList handleCreateList={this.handleCreateList} />
          : <CreateDeck handleCreateDeck={this.handleCreateDeck} />
           }
      </div>
    )
  }
}

Create.propTypes = {
  signedIn: PropTypes.bool.isRequired
}

export default Create;