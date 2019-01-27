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

NewCardOptions.propTypes = {
  lastSelectedQuality: PropTypes.number,
  submitCard: PropTypes.func.isRequired
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

NotNewCardOptions.propTypes = {
  submitCard: PropTypes.func.isRequired
}

function CardOptions(props) {
  const { isFlipped, isLearnerCard, submitCard, lastSelectedQuality, flip } = props;
  
  let keyMap;
  let keyHandlers;
  let options;

  if (isFlipped) {
    if (isLearnerCard) {

      // key handler code
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
    this.addClassDataPoint = this.addClassDataPoint.bind(this);
    this.learnerSubmit = this.learnerSubmit.bind(this);
  }

  flip() {
    this.setState((prevState) => ({isFlipped: !prevState.isFlipped}))
  }

  submitCard(quality, isLearner) {
    const { card, learner, isForClassroom, deckId, incrementIndex } = this.props;

    if (isLearner) {  
      // set card easinessFactor. If the card is new, there is no easiness factor. If the
      //    card is old but reentered learner func, then maintain old easiness factor
      let easinessFactor = null;
      if (card.data) {
        easinessFactor = card.data.easinessFactor;
      }

      // determine whether learner card will continue being learner, or can exit learner func
      if (quality >= 2) {
        // sends learner card to learnerSubmit since performance on learner card
        //    was adequate enough
        this.learnerSubmit(card.id, quality, easinessFactor);

        // flips back to front and moves onto the next card
        this.setState(() => ({
          isFlipped: false
        }), incrementIndex);
      } else {
        // sends learner card back into learner func.
        // note that the index is not incremented during this step because of the
        //    array shift.
        learner(card.id, quality, easinessFactor);
        this.setState(() => ({
          isFlipped: false
        }))
      }
    } else {
      // update card data doc
      let interval, easinessFactor, id;
      if (card.data) {
        ({ interval, easinessFactor, id } = card.data);
      }
      updateCardPersonalData(id, deckId, card.id, easinessFactor, interval, quality);
      if (isForClassroom) {
        this.addClassDataPoint(quality, card.id);
      }

      // flips back to front and moves onto the next card
      this.setState(() => ({
        isFlipped: false
      }), incrementIndex);
    }
  }

  learnerSubmit(cardId, quality, easinessFactor) {
    const { card, deckId, isForClassroom } = this.props;

    // determine quality to submit to personal data and to class data point if applicable
    // TODO: why is qualityToSubmit different from quality?
    let qualityToSubmit;
    if (quality == 2) {
      qualityToSubmit = 1;
    } else { // quality == 3
      qualityToSubmit = 3;
    }

    // submit card to personal data
    const dataId = card.data ? card.data.id : null;
    updateCardPersonalDataLearner(dataId, deckId, cardId, qualityToSubmit, easinessFactor || null); // note quality doesn't matter here. TODO: why?
    if (isForClassroom) {
      this.addClassDataPoint(qualityToSubmit, cardId);
    }
  }

  addClassDataPoint(quality, cardId) {
    const { id } = this.props.match.params;
    const { classroomId, period } = this.props.location.state;
    createClassDataPoint({
      quality: quality,
      time: 9999, // TODO: implement time in study sessions
      cardId: cardId,
      deckId: id,
      classroomId: classroomId,
      period: period
    }).catch((err) => {
      console.error(err);
    })
  }

  render() {
    const { card } = this.props;

    const isLearnerCard = !card.data || card.isLearner;

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
  deckId: PropTypes.string.isRequired,
  isForClassroom: PropTypes.bool.isRequired,
  incrementIndex: PropTypes.func.isRequired,
  learner: PropTypes.func.isRequired
}

/**
 * Parent component for the studying decks view. This component handles all logic regarding
 *  cards relating to each other and regarding the overall deck to study, i.e things like
 *  which card comes next, which card index are we at, changing card order,
 *  changing the cards that are up for studying, etc
 */
class StudyDeck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      creatorName: '',
      index: 0,
      arrayTodo: [],
      arrayLeft: [],
      isForClassroom: false
    }

    // TODO: check for state.id in StudyDeck

    this.incrementIndex = this.incrementIndex.bind(this);
    this.override = this.override.bind(this);
    this.learner = this.learner.bind(this);
  }

  componentDidMount() {
    this.getDeck();
  } 

  getDeck() {
    const { id } = this.props.match.params;

    // gets the deck for study
    getDeckForStudy(id).then((res) => {
      return Promise.all([
        getUserProfileInfo(res.creatorId),
        Promise.resolve(res)
      ]);
    }).then((results) => {
      const profileInfo = results[0];
      const res = results[1];
      results[1].creatorName = results[0].data().name;
      return res;
    }).then((result) => {
      const { name, creatorName, arrayDue, arrayNew, arrayLeft } = result;
      let newState = {
        name: name,
        creatorName: creatorName,
        arrayTodo: arrayDue.concat(arrayNew),
        arrayLeft: arrayLeft
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

      this.setState(() => newState);
    }).catch((err) => {
      alert(`Our apologies -- there was an error! Please go back to the 
        dashboard or refresh the page.`);
      console.error(err);
    });
  }

  learner(cardId, quality, easinessFactor) {    
    if (quality == 0) {
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
    } else { // quality == 1
      this.setState((prevState) => { 
        const { arrayTodo, index } = prevState;
        arrayTodo[index].lastSelectedQuality = 1;
        shiftInArray(arrayTodo, prevState.index, arrayTodo.length - 1);
        return {
          arrayTodo: arrayTodo,
        }
      });
    }
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
    const { id } = this.props.match.params;
    const { name, creatorName, arrayTodo, index, isForClassroom } = this.state;
    let classroomId, period;
    if (this.props.location.state) {
      ({ classroomId, period } = this.props.location.state);
    }

    const card = arrayTodo[index] || {};
    const isDone = (index >= arrayTodo.length);
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
            strokeColor="#003466" />
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
                  isForClassroom={isForClassroom}
                  classroomId={classroomId}
                  period={period} />
              </div>
          }
        </div>
      </div>
    )
  }
}


export default StudyDeck;