import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import Profile from './Profile.js';
import { createDeckCurrentUser, createConceptListCurrentUser } from '../utils/api';
import routes from '../routes/routes';
import TextareaAutosize from 'react-autosize-textarea';

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
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSwitch = this.handleSwitch.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initialFront != this.props.initialFront || prevProps.initialBack != this.props.initialBack) {
      this.setState(() => ({
        front: this.props.initialFront,
        back: this.props.initialBack
      }))
    }
  }

  handleSwitch() {
    this.props.switch(this.props.index);
  }

  handleChange(side, e) {
    const newValue = e.target.value;
    this.setState(() => ({
      [side]: newValue
    }));
  }

  handleSave() {
    this.props.save(this.props.index, this.state.front, this.state.back);
  }

  handleDelete() {
    this.props.delete(this.props.index);
  }

  render() {  

    return (
      <div className = 'flashcard'>
        <TextareaAutosize 
          type='text'
          className = 'flashcard-text'
          key='front'
          value={this.state.front}
          onChange={(e) => {this.handleChange('front', e)}}
          onBlur={this.handleSave}
          placeholder='front' />
        <div className = 'side-menu'>
          <img style={{cursor: 'pointer'}} onClick={this.handleSwitch} className = 'switch-front-and-back' src = '../src/resources/flashcard-img/switch.png' />
        </div>
        <TextareaAutosize 
          type='text'
          className = 'flashcard-text' 
          key='back'
          value={this.state.back}
          onChange={(e) => {this.handleChange('back', e)}}
          onBlur={this.handleSave}
          placeholder='back' />

        <div className = 'side-menu'>
          <img style={{cursor: 'pointer'}} onClick={this.handleDelete} className = 'side-options' src = '../src/resources/flashcard-img/trash.png' />
        </div>
      </div>
    )
  }
}

CreateDeckCard.propTypes = {
  initialFront: PropTypes.string.isRequired,
  initialBack: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
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
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleChange(e) {
    e.persist();
    this.setState(() => ({
      question: e.target.value
    }));
  }

  handleSave() {
    this.props.save(this.props.index, this.state.question);
  }

  handleDelete() {
    this.props.delete(this.props.index);
  }

  render() {
    return (
      <div className = 'flashcard'>
        <input type='text' 
          maxLength='200'
          className = 'flashcard-text'
          index = 'concept-card'
          key='question'
          value={this.state.question}
          onChange={this.handleChange}
          onBlur={this.handleSave}
          placeholder='question or concept' />
        <div className = 'side-menu'>
          <img style={{cursor: 'pointer'}} onClick={this.handleDelete} className = 'side-options' src = '../src/resources/flashcard-img/trash.png' />
        </div>
      </div>
    )
  }
}

CreateConceptCard.propTypes = {
  initialQuestion: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  save: PropTypes.func.isRequired
}

class CreateDeck extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      cards: [{
        front: '',
        back: '',
        id: shortid.generate()
      },{
        front: '',
        back: '',
        id: shortid.generate()
      },{
        front: '',
        back: '',
        id: shortid.generate()
      }]
    }

    this.handleAddCard = this.handleAddCard.bind(this);
    this.save = this.save.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.switch = this.switch.bind(this);
  }

  handleAddCard() {
    this.setState((prevState) => {
      const cards = prevState.cards;
      cards.push({
        front: '',
        back: '',
        id: shortid.generate()
      });
      return {
        cards: cards
      }
    });
  }

  deleteCard(index) {
    this.setState((prevState) => {
      let cards = prevState.cards;
      cards.splice(index, 1);
      return {
        cards: cards
      }
    });
  }

  save(index, newFront, newBack) {
    this.setState((prevState) => {
      const cards = prevState.cards;
      const oldCard = cards[index];
      cards[index] = {
        id: oldCard.id,
        front: newFront,
        back: newBack
      }

      return {
        cards: cards
      }
    })
  }

  switch(index) {
    this.setState((prevState) => {
      let cards = prevState.cards;
      let temp = cards[index].front;
      cards[index].front = cards[index].back;
      cards[index].back = temp;
      return {
        cards: cards
      }
    })
  }

  render() {
    return (
      <div>
        <div>
          {this.state.cards.map((card, index) => 
            <CreateDeckCard  
              initialFront={card.front} 
              initialBack={card.back} 
              index={index} 
              key={card.id}
              save={this.save}
              switch={this.switch}
              delete={this.deleteCard} />
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
      concepts: [{
        question: '',
        answer: '',
        id: shortid.generate()
      }]
    }

    this.handleAddConcept = this.handleAddConcept.bind(this);
    this.deleteConcept = this.deleteConcept.bind(this);
    this.save = this.save.bind(this);
  }

  handleAddConcept() {
    this.setState((prevState) => {
      const concepts = prevState.concepts;
      concepts.push({
        question: '',
        answer: '',
        id: shortid.generate()
      });
      return {
        concepts: concepts
      }
    });
  }

  deleteConcept(index) {
    this.setState((prevState) => {
      let concepts = prevState.concepts;
      concepts.splice(index, 1);
      return {
        concepts: concepts,
      }
    });
  }

  save(index, newQuestion) {
    this.setState((prevState) => {
      const concepts = prevState.concepts;
      const oldConcept = concepts[index];
      concepts[index] = {
        id: oldConcept.id,
        question: newQuestion
      }

      return {
        concepts: concepts
      }
    })
  }

  render() {
    return (
      <div>
        <div>
          {this.state.concepts.map((concept, index) => 
            <CreateConceptCard  
              delete={this.deleteConcept}
              initialQuestion={concept.question} 
              index={index} 
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
    if (this.state.title.trim() === '') {
      alert('Title cannot be empty.');
    } else if (this.hasEmptyEntries('concepts', concepts)) {
      alert('One or more of your concepts is empty.');
    } else {
      createConceptListCurrentUser(this.state.title, concepts).then(() => {
        this.props.history.push(routes.dashboardRoute);
      }).catch((err) => {
        console.error(err);
      });  
    }
  }

  handleCreateDeck(cards) {
    if (this.state.title.trim() === '') {
      alert('Title cannot be empty.');
    } else if (this.hasEmptyEntries('decks', cards)) {
      alert('One or more of your card entries is empty.');
    } else {  
      createDeckCurrentUser(this.state.title, cards).then(() => {
        this.props.history.push(routes.dashboardRoute);
      }).catch((err) => {
        console.error(err);
      });
    }
  }

  hasEmptyEntries(type, content) {
    if (type === 'concepts') {
      for (let i = 0; i < content.length; i++) {
        let item = content[i];
        if (item.question.trim() === '') {
          return true;
        }
      }
    } else { // type === 'decks'
      for (let i = 0; i < content.length; i++) {
        let item = content[i];
        if (item.front.trim() === '' || item.back.trim() === '') {
          return true;
        }
      }
    }
    return false;
  }

  render() {
    return (
      <div>
        <div className = 'deck-info'>
          <input type='text'
            maxLength='150'
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