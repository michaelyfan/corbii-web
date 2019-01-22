import React from 'react';
import PropTypes from 'prop-types';
import { getDeckForStudy, getUserProfileInfo, updateCardPersonalData, updateCardPersonalDataLearner, createClassDataPoint } from '../utils/api';
import { shiftInArray } from '../utils/tools';
import routes from '../routes/routes';
import {HotKeys} from 'react-hotkeys';
import { Line } from 'rc-progress';
import Title from './reusables/Title';

function NewCardOptions(props) {

  const { lastSelectedQuality, submitCard } = props;

  let options;
  if (lastSelectedQuality == 0) { // 'very soon' selected
    options = 
      <div className = 'accuracy-center'>
        <div className = 'center-button'>
          <button className = 'accuracy-button red' onClick={() => {submitCard(0, true)}}>i do not know this card</button>
        </div>
        <div className = 'center-button'>
          <button className = 'accuracy-button yellow' onClick={() => {submitCard(1, true)}}>i know this card</button>
        </div>
      </div>
  } else if (lastSelectedQuality == 1) { // 'not soon' selected
    options = 
      <div className = 'accuracy-center'>
        <div className = 'center-button'>
          <button className = 'accuracy-button red' onClick={() => {submitCard(0, true)}}>i do not know this card</button>
        </div>
        <div className = 'center-button'>
          <button className = 'accuracy-button yellow' onClick={() => {submitCard(1, true)}}>i am unsure about this card</button>
        </div>
        <div className = 'center-button'>  
          <button className = 'accuracy-button green' onClick={() => {submitCard(2, true)}}>i know this card</button>
        </div>
      </div>
  } else { // first time seeing card
    options = 
      <div className = 'accuracy-center'>
        <div className = 'center-button'>
          <button className = 'accuracy-button red' onClick={() => {submitCard(0, true)}}>i do not know this card</button>
        </div>
        <div className = 'center-button'>
          <button className = 'accuracy-button yellow' onClick={() => {submitCard(1, true)}}>i am unsure about this card</button>
        </div>
        <div className = 'center-button'>  
          <button className = 'accuracy-button green' onClick={() => {submitCard(3, true)}}>i definitely know this card</button>
        </div>
      </div>
  }

  return (
    <div className = 'option-menu center-button'>
      {options}
    </div>
  )
}

function NotNewCardOptions(props) {
  const { submitCard } = props;

  return (
    <div>
      <p className = 'rating-prompt' id = 'rating-question'> on a scale of one to six, how comfortable are you with this card?</p>
      <p className = 'rating-prompt'> one = very uncomfortable &nbsp; &nbsp; six = very comfortable</p>
      <div className = 'rating-buttons'>
        <button className = 'accuracy-button maroon number-scale' onClick={() => {submitCard(0, true)}}>1</button>
        <button className = 'accuracy-button red number-scale' onClick={() => {submitCard(0, true)}}>2</button>
        <button className = 'accuracy-button orange number-scale' onClick={() => {submitCard(0, true)}}>3</button>
        <button className = 'accuracy-button yellow number-scale' onClick={() => {submitCard(3, false)}}>4</button>
        <button className = 'accuracy-button lime number-scale' onClick={() => {submitCard(4, false)}}>5</button>
        <button className = 'accuracy-button green number-scale' onClick={() => {submitCard(5, false)}}>6</button>
      </div>
    </div>
  )
}

function CardOptions(props) {
  const { isFlipped, isLearnerCard, submitCard, lastSelectedQuality, flip } = props;

  let keyMap;
  let keyHandlers;
  let options;
  if (isFlipped) {
    if (isLearnerCard) {
      keyMap = {
        'one': '1',
        'two': '2',
        'three': '3',
      }
      if (lastSelectedQuality == 0) {
        keyHandlers = {
          'one': (event) => {submitCard(0, true)},
          'two': (event) => {submitCard(1, true)}
        }
      } else if (lastSelectedQuality == 1) {
        keyHandlers = {
          'one': (event) => {submitCard(0, true)},
          'two': (event) => {submitCard(1, true)},
          'three': (event) => {submitCard(2, true)}
        }
      } else {
        keyHandlers = {
          'one': (event) => {submitCard(0, true)},
          'two': (event) => {submitCard(1, true)},
          'three': (event) => {submitCard(3, true)}
        }
      }
      options = <NewCardOptions 
                  submitCard={submitCard}
                  lastSelectedQuality={lastSelectedQuality} />
    } else {
      keyMap = {
        'one': '1',
        'two': '2',
        'three': '3',
        'four': '4',
        'five': '5',
        'six': '6',
      }
      keyHandlers = {
        'one': (event) => {submitCard(0, true)},
        'two': (event) => {submitCard(0, true)},
        'three': (event) => {submitCard(0, true)},
        'four': (event) => {submitCard(3, false)},
        'five': (event) => {submitCard(4, false)},
        'six': (event) => {submitCard(5, false)}
      }
      options = <NotNewCardOptions submitCard={submitCard} />
    }
  } else {
    keyMap = {
      'flip-card': 'space'
    }
    keyHandlers = {
      'flip-card': flip
    }
    options = (
      <div className='center-button'>
        <button className = 'primary-button' 
          id = 'flip-card' 
          onClick={flip}>
          flip card
        </button>
      </div>
    )
  }

  return (
    <HotKeys keyMap = {keyMap} handlers = {keyHandlers} focused={true} attach={window}>
      <div>
        {options}
      </div>              
    </HotKeys>
  )
}

CardOptions.propTypes = {
  isFlipped: PropTypes.bool.isRequired,
  submitCard: PropTypes.func.isRequired,
  flip: PropTypes.func.isRequired,
  lastSelectedQuality: PropTypes.number,
  isLearnerCard: PropTypes.bool
}

function CardContent(props) {
  const { isFlipped, card } = props;
  return (
    <div className = 'study-card'>        
      <div className= 'flashcard-text studying'>
        <p className = 'front-text'>
          { isFlipped
              ? card && card.back
              : card && card.front
          }
        </p>
      </div>
    </div>
  )
}

CardContent.propTypes = {
  card: PropTypes.object,
  isFlipped: PropTypes.bool.isRequired
}

class CardWrapper extends React.Component {
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
      this.setState(() => ({
        isFlipped: false
      }));
    } else {
      const { card, cardData, isForClassroom, addClassDataPoint } = this.props;
      const { interval, easinessFactor } = cardData;
      const dataId = cardData ? cardData.id : null;

      updateCardPersonalData(dataId, this.props.deckId, card.id, easinessFactor, interval, quality);
      if (isForClassroom) {
        addClassDataPoint(quality, card.id);
      }
      this.setState(() => ({
        isFlipped: false
      }));
      this.props.incrementIndex();
    }
  }

  render() {
    const { cardData, card } = this.props;

    const isLearnerCard = !cardData || card.isLearner;

    return (
      <div>
        <CardContent isFlipped={this.state.isFlipped} card={card} />
        <CardOptions 
          isFlipped={this.state.isFlipped} 
          isLearnerCard={isLearnerCard}
          lastSelectedQuality={card ? card.lastSelectedQuality : null}
          submitCard={this.submitCard}
          flip={this.flip} />

      </div>
    )
  }
}

CardWrapper.propTypes = {
  classroomId: PropTypes.string,
  period: PropTypes.string,
  card: PropTypes.object, 
  cardData: PropTypes.object,
  deckId: PropTypes.string.isRequired,
  isForClassroom: PropTypes.bool.isRequired,
  addClassDataPoint: PropTypes.func.isRequired,
  incrementIndex: PropTypes.func.isRequired,
  learner: PropTypes.func.isRequired
}

class StudyDeck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      creatorName: '',
      id: '',
      index: 0,
      arrayTodo: [],
      arrayLeft: [],
      personalData: {},
      isForClassroom: false
    }

    this.incrementIndex = this.incrementIndex.bind(this);
    this.override = this.override.bind(this);
    this.learner = this.learner.bind(this);
    this.addClassDataPoint = this.addClassDataPoint.bind(this);
  }

  componentDidMount() {
    this.getDeck();
  } 

  getDeck() {
    const { id } = this.props.match.params;
    if (this.props.location.pathname.includes(routes.classroomStudy))

    console.log('Going to get the deck');
    getDeckForStudy(id).then((result) => {
      console.log('Deck gotten');
      return getUserProfileInfo(result.creatorId).then((result2) => {
        result.creatorName = result2.data().name;
        return result;
      });
    }).then((result) => {
      const { name, creatorName, arrayDue, arrayNew, arrayLeft, personalData } = result;
      let newState = {
        name: name,
        creatorName: creatorName,
        arrayTodo: arrayDue.concat(arrayNew),
        arrayLeft: arrayLeft,
        personalData: personalData,
        id: id
      };
      
      if (this.props.location.pathname.includes(routes.classroomStudy)) {
        const routeState = this.props.location.state;
        if (routeState && routeState.fromClassroom) {
          newState.isForClassroom = routeState.fromClassroom;
        } else {
          alert(`There was an error. Please go back to the dashboard.`);
          console.error('No location state found despite classstudy route.');
          return;
        }
      }

      this.setState(() => {
        return newState;
      });

    }).catch((err) => {
      console.error(err);
    });
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
          arrayTodo: arrayTodo,
        }
      });
    } else if (quality == 1) {
      this.setState((prevState) => { 
        const { arrayTodo, index } = prevState;
        arrayTodo[index].lastSelectedQuality = 1;
        shiftInArray(arrayTodo, prevState.index, arrayTodo.length - 1);
        return {
          arrayTodo: arrayTodo,
        }
      });
    } else if (quality == 2) { 
      const { id, arrayTodo, index, personalData, isForClassroom } = this.state;
      const dataId = personalData ? (personalData[arrayTodo[index].id] ? personalData[arrayTodo[index].id].id : null) : null;
      updateCardPersonalDataLearner(dataId, id, arrayTodo[index].id, 1, easinessFactor || null); // note quality doesn't matter here
      if (isForClassroom) {
        this.addClassDataPoint(1, cardId);
      }
      this.incrementIndex();
    } else { // quality == 3
      const { id, arrayTodo, index, personalData, isForClassroom } = this.state;
      const dataId = personalData ? (personalData[arrayTodo[index].id] ? personalData[arrayTodo[index].id].id : null) : null;
      updateCardPersonalDataLearner(dataId, id, arrayTodo[index].id, 3, easinessFactor || null); // note quality doesn't matter here
      if (isForClassroom) {
        this.addClassDataPoint(3, cardId);
      }
      this.incrementIndex();
    }
  }

  addClassDataPoint(quality, cardId) {
    const { id } = this.state;
    const { classroomId, period } = this.props.location.state;
    createClassDataPoint({
      quality: quality,
      time: 9999, // todo
      cardId: cardId,
      deckId: id,
      classroomId: classroomId,
      period: period
    }).catch((err) => {
      console.error(err);
    })
  }

  incrementIndex() {
    this.setState((prevState) => {
      const newIndex = prevState.index + 1;
      return {
        index: newIndex
      };
    });  
  }

  override() {
    if (this.state.arrayLeft.length <= 0) {
      alert('You have no more cards remaining.');
      this.props.history.push(routes.dashboard);
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
          arrayLeft: newArrayLeft
        }
      });
    }
  }


  render() {
    const { name, creatorName, arrayTodo, index, personalData, id, isForClassroom } = this.state;
    const routeState = this.props.location.state;
    let classroomId, period;
    if (routeState) {
      classroomId = routeState.classroomId;
      period = routeState.period;
    }

    const isDone = (index >= arrayTodo.length);
    const card = arrayTodo[index] || {};
    const cardData = personalData ? personalData[card.id] : null;
    let percentage = (index / arrayTodo.length) * 100;

    return (
      <div>
        <div>

          <Title
            text={name}
            titleLink={`${routes.viewDeck}/${id}`}
            subtitle={`created by ${creatorName}`} />

          { isForClassroom && <p className = 'small-caption'>Classroom: {classroomId}</p>}
          <Line 
            className = 'progress-bar' 
            percent={percentage} 
            strokeWidth="3"
            trailWidth='3'
            strokeColor="#003466"
          />
          { isDone
            ? <div>
                <p className = 'youre-finished'>you're finished!</p>
                <div className = 'center-button'>
                  <button className = 'primary-button' onClick={this.override}>continue studying</button>
                </div>
                <p className = 'study-warning'>keep in mind that studying past your set amount will decrease effectiveness.</p>
              </div>
            : <div>
                <CardWrapper 
                  deckId={id}
                  card={card}
                  incrementIndex={this.incrementIndex}
                  learner={this.learner}
                  cardData={cardData}
                  isForClassroom={isForClassroom}
                  classroomId={classroomId}
                  period={period}
                  addClassDataPoint={this.addClassDataPoint} />
              </div>
          }
        </div>
      </div>
    )
  }
}


export default StudyDeck;