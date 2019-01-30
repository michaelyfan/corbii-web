import React from 'react';
import PropTypes from 'prop-types';
import { getDeckForStudy, getUserProfileInfo, updateCardPersonalData, updateCardPersonalDataLearner, createClassDataPoint } from '../utils/api';
import { shiftInArray } from '../utils/tools';
import routes from '../routes/routes';
import {HotKeys} from 'react-hotkeys';
import { Line } from 'rc-progress';
import Title from './reusables/Title';

/**
 * Component for the views for the options of a card that is new.
 */
function NewCardOptions(props) {

  const { lastSelectedQuality, submitCard } = props;

  let options;
  if (lastSelectedQuality == 0) { // 'very soon' was the last selected button ('i do not know this card')
    options = 
      <div className = 'accuracy-center'>
        <div className = 'center-button'>
          <button className = 'accuracy-button red' onClick={() => {submitCard(0, true)}}>i do not know this card</button>
        </div>
        <div className = 'center-button'>
          <button className = 'accuracy-button yellow' onClick={() => {submitCard(1, true)}}>i know this card</button>
        </div>
      </div>
  } else if (lastSelectedQuality == 1) { // 'not soon' selected ('unsure')
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

/**
 * Component for the views for the options of a card that isn't new.
 */
function NotNewCardOptions(props) {
  const { submitCard } = props;

  return (
    <div>
      <p className = 'rating-prompt' id = 'rating-question'> on a scale of one to six, how comfortable are you with this card?</p>
      <p className = 'rating-prompt'> one = very uncomfortable &nbsp; &nbsp; six = very comfortable</p>
      <div className = 'rating-buttons'>
        {/* Send cards under a quality of 3 back into the learner function with a quality of 0 */}
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

/**
 * Parent component of a card's options. This component decides whether to render NewCardOptions
 *    or NotNewCardOptions, and contains the flip button. This component also contains all
 *    keybinding logic of deck studying.
 */
function CardOptions(props) {
  const { isFlipped, isLearnerCard, submitCard, lastSelectedQuality, flip } = props;
  
  let keyMap;
  let keyHandlers;
  let options;

  if (isFlipped) {
    // if flipped, determine options to display based on whether card is learner or not
    if (isLearnerCard) {
      options = <NewCardOptions 
                  submitCard={submitCard}
                  lastSelectedQuality={lastSelectedQuality} />

      // keybindings
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
    } else {
      options = <NotNewCardOptions submitCard={submitCard} />

      // keybindings
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
    }
  } else {
    // if not flipped, display flip card button
    options = (
      <div className='center-button'>
        <button className = 'primary-button' 
          id = 'flip-card' 
          onClick={flip}>
          flip card
        </button>
      </div>
    )

    // keybindings
    keyMap = {
      'flip-card': 'space'
    }
    keyHandlers = {
      'flip-card': flip
    }
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

/**
 * Component that renders the card view. This component displays the either the card front or the
 *    card back depending on the isFlipped prop.
 */
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

/**
 * Parent component of an individual card view. This component handles all logic concerning just
 *    one card i.e. the card's flip status, card submission (whether learner or not), etc.
 */
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
        learner(quality);
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

    // submit card to personal data
    const dataId = card.data ? card.data.id : null;

    // submit card to class data points if applicable
    if (isForClassroom) {
      let qualityToSubmit;
      // artificially change the submission quality to make class data points more intelligible
      // TODO: change how this works...ask Owen
      if (quality == 2) {
        qualityToSubmit = 1;
      } else { // quality == 3
        qualityToSubmit = 3;
      }
      this.addClassDataPoint(qualityToSubmit, cardId);
    }

    updateCardPersonalDataLearner(dataId, deckId, cardId, quality, easinessFactor)
      .catch((err) => {
        console.error(err);
      });
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

    /**
     * arrayTodo is the array of all card objects that are currently being studied, and learner
     *    cards that are "pushed back" are pushed back in arrayTodo. arrayLeft is the array
     *    of all cards eligible for override studying, and functions as the "pool" from
     *    which override() pulls from. Due to the SM2 algorithm, arrayLeft can only
     *    contain new cards.
     * 
     * arrayTodo and arrayLeft objects have the structure:
     *    {
     *      back: '',
     *      front: '',
     *      id: '', // cardId
     *      data: { // may be null
     *        ...spacedRepData data attributes...
     *        id: '' // dataId
     *      }
     *    }
     */
    this.state = {
      name: '',
      creatorName: '',
      index: 0,
      arrayTodo: [],
      arrayLeft: [],
      isForClassroom: false
    }

    this.incrementIndex = this.incrementIndex.bind(this);
    this.override = this.override.bind(this);
    this.learner = this.learner.bind(this);
  }

  componentDidMount() {
    this.getDeck();
  } 

  async getDeck() {
    const { id } = this.props.match.params;

    // gets the deck for study
    let deckForStudy;
    let profileInfo;
    try {
      deckForStudy = await(getDeckForStudy(id));
      profileInfo = await(getUserProfileInfo(deckForStudy.creatorId));
    } catch (e) {
      alert(`Our apologies -- there was an error! Please go back to the 
        dashboard or refresh the page.`);
      console.error(e);
    }
    
    // constructs state after getting deck
    const { name, arrayDue, arrayNew, arrayLeft } = result;
    const creatorName = profileInfo.data().name;
    let newState = {
      name: name,
      creatorName: creatorName,
      arrayTodo: arrayDue.concat(arrayNew),
      arrayLeft: arrayLeft
    };

    // determines isForClassroom state property
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
  }

  /**
   * Learner function for learner cards that aren't submitted, but are pushed back in the
   *    deck. Sets a new state with the card pushed back in arrayTodo.
   *
   * @param {number} quality - the quality this card was submitted with
   *
   */
  learner(quality) {
    this.setState((prevState) => {
      const { arrayTodo, index } = prevState;
      arrayTodo[index].lastSelectedQuality = quality;
      // marks this card as a learner card; this happens regardless of if the card is new or
      //    not new
      arrayTodo[index].isLearner = true;
      if (quality == 0) {
        if (arrayTodo.length < 5) {
          shiftInArray(arrayTodo, index, index + 3);
        } else {
          shiftInArray(arrayTodo, index, index + 5);
        }
      } else {
        shiftInArray(arrayTodo, prevState.index, arrayTodo.length - 1);
      }
      return {
        arrayTodo: arrayTodo
      }
    });
  }

  incrementIndex() {
    this.setState((prevState) => {
      const newIndex = prevState.index + 1;
      return {
        index: newIndex
      };
    });
  }

  /**
   * Handles studying "override" behavior by placing the cards in arrayLeft into arrayTodo.
   *    By the time this function is called, all cards in arrayTodo should've been studied by
   *    the user.
   */
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
        };
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