import React from 'react';
import PropTypes from 'prop-types';
import { getDeckForStudy, updateCardPersonalData } from '../utils/api';
import { shiftInArray } from '../utils/tools';
import queryString from 'query-string';




class NewCardOptions extends React.Component {
  render() {
    const lastSelectedQuality = this.props.card ? this.props.card.lastSelectedQuality : null;

    let options;
    if (lastSelectedQuality == 0) { // 'very soon' selected
      options = 
        <div>
          <button onClick={() => {this.props.submitCard(0, true)}}>Very soon</button>
          <button onClick={() => {this.props.submitCard(1, true)}}>Not soon</button>
        </div>
    } else if (lastSelectedQuality == 1) { // 'not soon' selected
      options = 
        <div>
          <button onClick={() => {this.props.submitCard(0, true)}}>Very soon</button>
          <button onClick={() => {this.props.submitCard(1, true)}}>Not soon</button>
          <button onClick={() => {this.props.submitCard(2, true)}}>1 day</button>
        </div>
    } else { // first time seeing card
      options = 
        <div>
          <button onClick={() => {this.props.submitCard(0, true)}}>Very soon</button>
          <button onClick={() => {this.props.submitCard(1, true)}}>Not soon</button>
          <button onClick={() => {this.props.submitCard(3, true)}}>I know</button>
        </div>
    }

    return (
      <div>
        {options}
      </div>
    )
  }
}

class NotNewCardOptions extends React.Component {
  render() {
    return (
      <div>
        <button onClick={() => {this.props.submitCard(0, false)}}>1</button>
        <button onClick={() => {this.props.submitCard(1, false)}}>2</button>
        <button onClick={() => {this.props.submitCard(2, false)}}>3</button>
        <button onClick={() => {this.props.submitCard(3, false)}}>4</button>
        <button onClick={() => {this.props.submitCard(4, false)}}>5</button>
        <button onClick={() => {this.props.submitCard(5, false)}}>6</button>
      </div>
    )
  }
}

class StudyCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFlipped: false
    }

    this.submitCard = this.submitCard.bind(this);
    this.flip = this.flip.bind(this);
  }

  flip() {
    this.setState((prevState) => ({isFlipped: !prevState.isFlipped}))
  }

  submitCard(quality, isNew) {
    if (isNew) {
      this.props.learner(quality, this.props.card.id);
    } else {
      // quality from 0 - 5 inclusive
      const { card, cardData } = this.props;
      const { interval, easinessFactor } = cardData;
      updateCardPersonalData(this.props.deckId, card.id, interval, easinessFactor, quality);
      this.props.changeIndex(false);
    }
    this.setState(() => ({
      isFlipped: false
    }));
  }

  render() {
    return (
      <div>
        <div className='study-card'>
          <p style={{fontSize: '48px'}}>
            { this.state.isFlipped
                ? this.props.card && this.props.card.back
                : this.props.card && this.props.card.front
            }
          </p>
        </div>
        <div>
          {
            this.state.isFlipped 
              ? <div>
                  { this.props.cardData 
                      ? <NotNewCardOptions submitCard={this.submitCard} />
                      : <NewCardOptions 
                          submitCard={this.submitCard}
                          card={this.props.card} />
                  }
                </div>
              : <button onClick={this.flip}>Flip card</button>
          }
        </div>
        

      </div>
    )
  }
}

StudyCard.propTypes = {
  card: PropTypes.object, 
  cardData: PropTypes.object,
  deckId: PropTypes.string.isRequired,
  changeIndex: PropTypes.func.isRequired,
  learner: PropTypes.func.isRequired
}

class StudyDeck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      creator: '',
      id: '',
      index: 0,
      arrayTodo: [],
      arrayLeft: [],
      personalData: {},
      isDone: false,
    }

    this.changeIndex = this.changeIndex.bind(this);
    this.override = this.override.bind(this);
    this.learner = this.learner.bind(this);
  }

  learner(quality, cardId) {
    /*
      0: very soon
      1: not soon
      2: 1 day
      3: I know
    */
    if (quality < 0 || quality > 3) {
      throw new Error('Invalid quality');
    } else if (quality == 0) {
      this.setState((prevState) => {
        const { arrayTodo, index } = prevState;
        arrayTodo[index].lastSelectedQuality = 0;
        if (arrayTodo.length < 5) {
          shiftInArray(arrayTodo, index, index + 3);
        } else {
          shiftInArray(arrayTodo, index, index + 5);
        }
        return {
          arrayTodo: arrayTodo
        }
      });
    } else if (quality == 1) {
      this.setState((prevState) => {
        
        const { arrayTodo, index } = prevState;
        arrayTodo[index].lastSelectedQuality = 1;
        shiftInArray(arrayTodo, prevState.index, arrayTodo.length - 1);
        return {
          arrayTodo: arrayTodo
        }
      });
    } else if (quality == 2) { 
      const { id, arrayTodo, index } = this.state;
      updateCardPersonalData(id, arrayTodo[index].id, 2.5, 0, 1);
      this.changeIndex(false);
    } else { // quality == 3
      const { id, arrayTodo, index } = this.state;
      updateCardPersonalData(id, arrayTodo[index].id, 2.5, 1, 1);
      this.changeIndex(false);
    }

  }

  componentDidMount() {
    this.getDeck();
  } 

  getDeck() {
    const { d } = queryString.parse(this.props.location.search);
    getDeckForStudy(d).then((result) => {
      const { name, creator, arrayDue, arrayNew, arrayLeft, personalData } = result;
      this.setState(() => ({
        name: name,
        creator: creator,
        arrayTodo: arrayDue.concat(arrayNew),
        arrayLeft: arrayLeft,
        personalData: personalData,
        id: d,
        isDone: arrayDue.concat(arrayNew).length === 0
      }), this.updateContent);
    }).catch((err) => {
      console.error(err);
    });
  }

  changeIndex(isDecrement) {
    if (isDecrement) {
      this.setState((prevState) => ({index: prevState.index - 1}));
    } else {
      this.setState((prevState) => {
        const newIndex = prevState.index + 1;
        return {
          index: newIndex,
          isDone: newIndex >= prevState.arrayTodo.length
        };
      });  
    }
  }

  override() {
    if (this.state.arrayLeft.length <= 0) {
      alert('You have no more cards remaining.');
    } else {
      this.setState((prevState) => {
        let newArrayTodo;
        let newArrayLeft;
        if (prevState.arrayLeft.length < 20) {
          newArrayTodo = prevState.arrayLeft;
          newArrayLeft = [];
        } else {
          newArrayLeft = prevState.arrayLeft;
          newArrayTodo = newArrayLeft.splice(0, 20);
        }

        return {
          index: 0,
          arrayTodo: newArrayTodo,
          arrayLeft: newArrayLeft,
          isDone: false
        }
      });
    }
  }


  render() {
    const { name, creator, arrayTodo, index, personalData, id, isDone } = this.state;

    const card = arrayTodo[index] || {};
    const cardData = personalData ? personalData[card.id] : null;
    return (
      <div>
        <div>
          <h1>{name}</h1>
          <h5>Created by {creator}</h5>
          { isDone 
            ? <div>
                <p>You're finished!</p>
                <button onClick={this.override}>Continue studying</button>
                <p>Keep in mind that studying past your set amount will decrease effectiveness.</p>
              </div>
            : <StudyCard 
                deckId={id}
                card={card}
                changeIndex={this.changeIndex}
                learner={this.learner}
                cardData={cardData} />
          }
          
        </div>
      </div>
    )
  }
}


export default StudyDeck;