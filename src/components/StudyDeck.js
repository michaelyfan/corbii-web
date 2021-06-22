import React from 'react';
import PropTypes from 'prop-types';
import { getDeckForStudy, getUserProfileInfo, updateCardPersonalData, updateCardPersonalDataLearner } from '../utils/api';
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

  // define button options
  const option1 = () => {submitCard(0, true);};
  const option2 = () => {submitCard(1, true);};
  const option3 = () => {submitCard(2, true);};
  const option4 = () => {submitCard(3, true);};

  // set keybindings
  const keyMap = {
    'one': '1',
    'two': '2',
    'three': '3',
  };
  let keyHandlers;
  let options;
  if (lastSelectedQuality == 0) { // 'very soon' was the last selected button ('i do not know this card')
    keyHandlers = {
      'one': option1,
      'two': option2
    };
    options = 
      <div className = 'accuracy-center'>
        <div className = 'center-button'>
          <button className = 'accuracy-button red' onClick={option1}>i do not know this card</button>
        </div>
        <div className = 'center-button'>
          <button className = 'accuracy-button yellow' onClick={option2}>i know this card</button>
        </div>
      </div>;
  } else if (lastSelectedQuality == 1) { // 'not soon' selected ('unsure')
    keyHandlers = {
      'one': option1,
      'two': option2,
      'three': option3
    };
    options = 
      <div className = 'accuracy-center'>
        <div className = 'center-button'>
          <button className = 'accuracy-button red' onClick={option1}>i do not know this card</button>
        </div>
        <div className = 'center-button'>
          <button className = 'accuracy-button yellow' onClick={option2}>i am unsure about this card</button>
        </div>
        <div className = 'center-button'>  
          <button className = 'accuracy-button green' onClick={option3}>i know this card</button>
        </div>
      </div>;
  } else { // first time seeing card (this card has not gone through learner function yet)
    keyHandlers = {
      'one': option1,
      'two': option2,
      'three': option4
    };
    options = 
      <div className = 'accuracy-center'>
        <div className = 'center-button'>
          <button className = 'accuracy-button red' onClick={option1}>i do not know this card</button>
        </div>
        <div className = 'center-button'>
          <button className = 'accuracy-button yellow' onClick={option2}>i am unsure about this card</button>
        </div>
        <div className = 'center-button'>  
          <button className = 'accuracy-button green' onClick={option4}>i definitely know this card</button>
        </div>
      </div>;
  }

  return (
    <HotKeys keyMap = {keyMap} handlers = {keyHandlers} focused={true} attach={window}>
      <div className = 'option-menu center-button'>
        {options}
      </div>
    </HotKeys>
  );
}

/**
 * Component for the views for the options of a card that isn't new.
 */
function NotNewCardOptions(props) {
  const { submitCard } = props;
  
  // define button options
  const option1 = () => {submitCard(0, true);};
  const option2 = () => {submitCard(1, true);};
  const option3 = () => {submitCard(2, true);};
  const option4 = () => {submitCard(3, false);};
  const option5 = () => {submitCard(4, false);};
  const option6 = () => {submitCard(5, false);};

  // set keybindings
  const keyMap = {
    'one': '1',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
  };
  const keyHandlers = {
    'one': option1,
    'two': option2,
    'three': option3,
    'four': option4,
    'five': option5,
    'six': option6
  };

  return (
    <HotKeys keyMap = {keyMap} handlers = {keyHandlers} focused={true} attach={window}>
      <div>
        <p className = 'rating-prompt' id = 'rating-question'> on a scale of one to six, how comfortable are you with this card?</p>
        <p className = 'rating-prompt'> one = very uncomfortable &nbsp; &nbsp; six = very comfortable</p>
        <div className = 'rating-buttons'>
          {/* Send cards under a quality of 3 back into the learner function with a quality of 0 */}
          <button className = 'accuracy-button maroon number-scale' onClick={option1}>1</button>
          <button className = 'accuracy-button red number-scale' onClick={option2}>2</button>
          <button className = 'accuracy-button orange number-scale' onClick={option3}>3</button>
          <button className = 'accuracy-button yellow number-scale' onClick={option4}>4</button>
          <button className = 'accuracy-button lime number-scale' onClick={option5}>5</button>
          <button className = 'accuracy-button green number-scale' onClick={option6}>6</button>
        </div>
      </div>
    </HotKeys>
  );
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
        lastSelectedQuality={lastSelectedQuality} />;
      return options;
    } else {
      options = <NotNewCardOptions submitCard={submitCard} />;
      return options;
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
    );

    // set keybindings
    keyMap = {
      'flip-card': 'space'
    };
    keyHandlers = {
      'flip-card': flip
    };

    return (
      <HotKeys keyMap = {keyMap} handlers = {keyHandlers} focused={true} attach={window}>
        <div>
          {options}
        </div>              
      </HotKeys>
    );
  }
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
  );
}

/**
 * Parent component of an individual card view. This component handles all logic concerning just
 *    one card i.e. the card's flip status, card submission (whether learner or not), etc.
 */
class CardWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFlipped: false,
      seconds: 0 // for keeping time
    };

    this.submitCard = this.submitCard.bind(this);
    this.flip = this.flip.bind(this);
    this.learnerSubmit = this.learnerSubmit.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState((prevState) => ({
        seconds: prevState.seconds + 1
      }));
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  flip() {
    this.setState((prevState) => ({isFlipped: !prevState.isFlipped}));
  }

  submitCard(quality, isLearner) {
    const { card, learner, deckId, incrementIndex } = this.props;
    const { seconds } = this.state;

    // sets this card's lowest selected quality
    if (card.lowestSelectedQuality == null) {
      // add lowestSelectedQuality attribute to card if not existing
      card.lowestSelectedQuality = quality;
    } else {
      // replace card's lowest selected quality if current quality is lower
      if (quality < card.lowestSelectedQuality) { 
        card.lowestSelectedQuality = quality;
      }
    }
    if (isLearner) {
      // set card easinessFactor. If the card is new, there is no easiness factor. If the
      //    card is old but reentered learner func, then maintain old easiness factor
      let easinessFactor = null;
      if (card.data) {
        easinessFactor = card.data.easinessFactor;
      }

      // determine whether learner card will continue being learner, or can exit learner func
      // learner card may exit the learner func if quality is greater than or equal to 2,
      //    unless this card is an old card that reentered the learner function
      if (quality <= 1 || (quality === 2 && card.data != null && card.lastSelectedQuality == null )) {
        // sends learner card back into learner func with the provided quality, or with a quality
        //    of 0 if this card is not new but reentering the learner function on this submit
        // note that the index is not incremented during this step because of the array shift.
        if (card.data && card.lastSelectedQuality == null) {
          learner(0);
        } else {
          learner(quality);
        }
        this.setState(() => ({
          isFlipped: false,
          seconds: 0
        }));
      } else {
        // sends learner card to learnerSubmit since performance on learner card
        //    was adequate enough, unless this is an old card reentering the
        //    learner function
        this.learnerSubmit(card.id, quality, easinessFactor, seconds);

        // flips back to front, resets time count, and moves onto the next card
        this.setState(() => ({
          isFlipped: false,
          seconds: 0
        }), incrementIndex);
      }
    } else {
      if (card.lowestSelectedQuality !== quality) {
        console.error('Non-learner cards shouldn\'t have a different lowestSelectedQuality from quality');
      }

      // update card data doc
      let interval, easinessFactor, id;
      if (card.data) {
        ({ interval, easinessFactor, id } = card.data);
      }
      updateCardPersonalData(id, deckId, card.id, easinessFactor, interval, quality);

      // flips back to front, resets time count, and moves onto the next card
      this.setState(() => ({
        isFlipped: false,
        seconds: 0
      }), incrementIndex);
    }
  }

  // eslint-disable-next-line
  learnerSubmit(cardId, quality, easinessFactor, time) {
    const { card, deckId } = this.props;

    // submit card to personal data
    const dataId = card.data ? card.data.id : null;

    updateCardPersonalDataLearner(dataId, deckId, cardId, quality, easinessFactor)
      .catch((err) => {
        console.error(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      });
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
    );
  }
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
     *      },
     *      isLearner: boolean // only exists when a card is marked as learner
     *      lastSelectedQuality: number // only exists when a card is marked as learner
     *      lowestSelectedQuality: number // only exists after a card has been studied this session
     *    }
     */
    this.state = {
      name: 'Loading...',
      creatorName: '',
      index: 0,
      arrayTodo: [],
      arrayLeft: [],
    };

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
      deckForStudy = await getDeckForStudy(id);
      profileInfo = await getUserProfileInfo(deckForStudy.creatorId);
    } catch (e) {
      console.error(e);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${e}`);
      return;
    }
    
    // constructs state after getting deck
    const { name, arrayDue, arrayNew, arrayLeft } = deckForStudy;
    const creatorName = profileInfo.data().name;
    let newState = {
      name: name,
      creatorName: creatorName,
      arrayTodo: arrayDue.concat(arrayNew),
      arrayLeft: arrayLeft
    };

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
      };
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
      this.props.history.push(routes.dashboard.base);
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
    const { name, creatorName, arrayTodo, index } = this.state;

    const card = arrayTodo[index] || {};
    const isDone = (index >= arrayTodo.length);
    let percentage = (index / arrayTodo.length) * 100;

    return (
      <div>
        <div>
          <Title
            text={name}
            titleLink={routes.viewDeck.getRoute(id)}
            subtitle={`created by ${creatorName}`} />

          <Line
            className = 'progress-bar' 
            percent={percentage} 
            strokeWidth="3"
            trailWidth='3'
            strokeColor="#003466" />
          { isDone
            ? <div>
              <p className = 'youre-finished'>you&apos;re finished!</p>
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
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

export default StudyDeck;

StudyDeck.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
CardWrapper.propTypes = {
  card: PropTypes.object, 
  deckId: PropTypes.string.isRequired,
  incrementIndex: PropTypes.func.isRequired,
  learner: PropTypes.func.isRequired
};
NewCardOptions.propTypes = {
  lastSelectedQuality: PropTypes.number,
  submitCard: PropTypes.func.isRequired
};
NotNewCardOptions.propTypes = {
  submitCard: PropTypes.func.isRequired
};
CardOptions.propTypes = {
  isFlipped: PropTypes.bool.isRequired,
  submitCard: PropTypes.func.isRequired,
  flip: PropTypes.func.isRequired,
  lastSelectedQuality: PropTypes.number,
  isLearnerCard: PropTypes.bool
};
CardContent.propTypes = {
  card: PropTypes.object,
  isFlipped: PropTypes.bool.isRequired
};
