import React from 'react';
import PropTypes from 'prop-types';
import { getDeckForStudy, getUserProfileInfo, updateCardPersonalData, updateCardPersonalDataLearner } from '../utils/api';
import { shiftInArray } from '../utils/tools';
import routes from '../routes/routes';
import queryString from 'query-string';

class NewCardOptions extends React.Component {
  render() {
    const lastSelectedQuality = this.props.card ? this.props.card.lastSelectedQuality : null;

    let options;
    if (lastSelectedQuality == 0) { // 'very soon' selected
      options = 
        <div className = 'accuracy-center'>
          <div className = 'center-button'>
            <button className = 'accuracy-button red' onClick={() => {this.props.submitCard(0, true)}}>i do not know this card</button>
          </div>
          <div className = 'center-button'>
            <button className = 'accuracy-button green' onClick={() => {this.props.submitCard(1, true)}}>i know this card</button>
          </div>
        </div>
    } else if (lastSelectedQuality == 1) { // 'not soon' selected
      options = 
        <div className = 'accuracy-center'>
          <div className = 'center-button'>
            <button className = 'accuracy-button red' onClick={() => {this.props.submitCard(0, true)}}>i do not know this card</button>
          </div>
          <div className = 'center-button'>
            <button className = 'accuracy-button yellow' onClick={() => {this.props.submitCard(1, true)}}>i am unsure about this card</button>
          </div>
          <div className = 'center-button'>  
            <button className = 'accuracy-button green' onClick={() => {this.props.submitCard(2, true)}}>i know this card</button>
          </div>
        </div>
    } else { // first time seeing card
      options = 
        <div className = 'accuracy-center'>
          <div className = 'center-button'>
            <button className = 'accuracy-button red' onClick={() => {this.props.submitCard(0, true)}}>i do not know this card</button>
          </div>
          <div className = 'center-button'>
            <button className = 'accuracy-button yellow' onClick={() => {this.props.submitCard(1, true)}}>i am unsure about this card</button>
          </div>
          <div className = 'center-button'>  
            <button className = 'accuracy-button green' onClick={() => {this.props.submitCard(3, true)}}>i definitely know this card</button>
          </div>
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
        <p className = 'rating-prompt' id = 'rating-question'> on a scale of one to six, how comfortable are you with this card?</p>
        <p className = 'rating-prompt'> one = very uncomfortable &nbsp; &nbsp; six = very comfortable</p>
        <div className = 'rating-buttons'>
          <button className = 'accuracy-button maroon number-scale' onClick={() => {this.props.submitCard(0, true)}}>1</button>
          <button className = 'accuracy-button red number-scale' onClick={() => {this.props.submitCard(0, true)}}>2</button>
          <button className = 'accuracy-button orange number-scale' onClick={() => {this.props.submitCard(0, true)}}>3</button>
          <button className = 'accuracy-button yellow number-scale' onClick={() => {this.props.submitCard(3, false)}}>4</button>
          <button className = 'accuracy-button lime number-scale' onClick={() => {this.props.submitCard(4, false)}}>5</button>
          <button className = 'accuracy-button green number-scale' onClick={() => {this.props.submitCard(5, false)}}>6</button>
        </div>
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

  submitCard(quality, isLearner) {
    if (isLearner) {
      let easinessFactor = null;
      if (this.props.cardData) { // this is not a new card, but 0, 1, or 2 was selected
        easinessFactor = this.props.cardData.easinessFactor;
      }
      this.props.learner(this.props.card.id, quality, easinessFactor);
    } else {
      const { card, cardData } = this.props;
      const { interval, easinessFactor } = cardData;
      updateCardPersonalData(this.props.deckId, card.id, easinessFactor, interval, quality);
      this.props.changeIndex(false);
    }
    this.setState(() => ({
      isFlipped: false
    }));
  }

  render() {
    const { cardData, card } = this.props;
    return (
      <div>
        <div className = 'study-card'>        
          <div className= 'flashcard-text'>
            <p className = 'front-text'>
              { this.state.isFlipped
                  ? card && card.back
                  : card && card.front
              }
            </p>
          </div>
        </div>
        <div>
          {
            this.state.isFlipped 
              ? <div>
                  { !cardData || card.isLearner
                      ? <NewCardOptions 
                          submitCard={this.submitCard}
                          card={card} />
                      : <NotNewCardOptions submitCard={this.submitCard} />
                  }
                </div>
              : <div className = 'center-button'>
                  <button 
                    className = 'primary-button' 
                    id = 'flip-card' 
                    onClick={this.flip}>
                      flip card
                  </button>
                </div>
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
      creatorName: '',
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

  learner(cardId, quality, easinessFactor) {
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
        arrayTodo[index].isLearner = true;
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
      updateCardPersonalDataLearner(id, arrayTodo[index].id, 1, easinessFactor || null); // note quality doesn't matter here
      this.changeIndex(false);
    } else { // quality == 3
      const { id, arrayTodo, index } = this.state;
      updateCardPersonalDataLearner(id, arrayTodo[index].id, 3, easinessFactor || null); // note quality doesn't matter here
      this.changeIndex(false);
    }

  }

  componentDidMount() {
    this.getDeck();
  } 

  getDeck() {
    const { id } = this.props.match.params;
    getDeckForStudy(id).then((result) => {
      return getUserProfileInfo(result.creator).then((result2) => {
        result.creatorName = result2.data().name;
        return result;
      });
    }).then((result) => {
      const { name, creator, creatorName, arrayDue, arrayNew, arrayLeft, personalData } = result;
      this.setState(() => ({
        name: name,
        creator: creator,
        creatorName: creatorName,
        arrayTodo: arrayDue.concat(arrayNew),
        arrayLeft: arrayLeft,
        personalData: personalData,
        id: id,
        isDone: arrayDue.concat(arrayNew).length === 0
      }));
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
      this.props.history.push(routes.dashboardRoute);
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
    const { name, creator, creatorName, arrayTodo, index, personalData, id, isDone } = this.state;

    const card = arrayTodo[index] || {};
    const cardData = personalData ? personalData[card.id] : null;
    return (
      <div>
        <div>
          <p className = 'deck-title'>{name}</p>
          <p className = 'small-caption'>Created by {creatorName}</p>
          { isDone 
            ? <div>
                <p className = 'youre-finished'>you're finished!</p>
                <div className = 'center-button'>
                  <button className = 'primary-button' onClick={this.override}>continue studying</button>
                </div>
                <p className = 'study-warning'>keep in mind that studying past your set amount will decrease effectiveness.</p>
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