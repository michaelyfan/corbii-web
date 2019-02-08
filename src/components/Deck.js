import React from 'react';
import { getDeck, getUserProfileInfo, createCard, updateCard, updateCurrentUserDeck, deleteDeckFromCurrentUser, deleteCard, getClassroomInfo } from '../utils/api';
import { updateDeckPeriods } from '../utils/teacherapi';
import firebase from '../utils/firebase';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from '../routes/routes';
import TextareaAutosize from 'react-autosize-textarea';
import { BigLoading } from './reusables/Loading';
import BackButton from './reusables/BackButton';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

class SelectPeriods extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.handleUpdateDeckPeriods = this.handleUpdateDeckPeriods.bind(this);
  }

  handleUpdateDeckPeriods(e) {
    e.preventDefault();
    const { deckId, periods } = this.props;
    this.setState(() => ({
      loading: true
    }), () => {
      updateDeckPeriods(deckId, periods).then(() => {
        this.setState(() => ({
          loading: false
        }));
      });
    });
  }

  render() {
    const { loading } = this.state;
    const { periods, handlePeriodChange } = this.props;
    return (
      <div>
        <p>Select the periods you&apos;d like to assign this deck to.</p>
        <form onSubmit={this.handleUpdateDeckPeriods}>
          {Object.keys(periods).map((period) =>
            <label key={period}> Period {period}:
              <input
                name={period}
                type='checkbox'
                checked={periods[period]}
                onChange={handlePeriodChange} />
            </label>
          )}
          <input type='submit' value={loading ? 'Loading...' : 'Submit'} />
        </form>
      </div>
    );
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      frontChangeValue: props.front.slice(0),
      backChangeValue: props.back.slice(0)
    };

    this.handleUpdateCard = this.handleUpdateCard.bind(this);
    this.handleFrontChange = this.handleFrontChange.bind(this);
    this.handleBackChange = this.handleBackChange.bind(this);
  }

  handleUpdateCard() {
    const { doUpdateCard, id } = this.props;
    const { frontChangeValue, backChangeValue } = this.state;
    doUpdateCard(id, frontChangeValue, backChangeValue);
    this.setState(() => ({isUpdate: false}));
  }

  handleFrontChange(e) {
    const value = e.target.value;
    this.setState(() => ({frontChangeValue: value}));
  }

  handleBackChange(e) {
    const value = e.target.value;
    this.setState(() => ({backChangeValue: value}));
  }

  render() {
    const { id, front, back, handleDeleteCard } = this.props;

    return (
      <div className='flashcard'>
        <div className='flashcard' id = 'less-padding'>
          <div className='flashcard-text edit-card'>
            <p className='low'>front</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <TextareaAutosize 
                  type='text'
                  value={this.state.frontChangeValue}
                  maxLength='1000'
                  onChange={this.handleFrontChange}
                  className = 'update-card' />
                : <p className = 'editable-card'>{front}</p>
            }
          </div>
          <div className = 'flashcard-text edit-card'>
            <p className='low'>back</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <TextareaAutosize 
                  type='text'
                  maxLength='1000'
                  value={this.state.backChangeValue}
                  onChange={this.handleBackChange} 
                  className = 'update-card'/>
                : <p className = 'editable-card'>{back}</p>
            }
          </div>
        </div>


        <div className='side-menu'>
          { 
            this.props.userIsOwner
              && <div>
                { this.state.isUpdate 
                  ? <span className = 'edit-options'>
                    <button className = 'modify-stuff editing' onClick={this.handleUpdateCard}>update</button>
                    <button className = 'modify-stuff editing' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}));}}>cancel</button>
                  </span>     
                  : <span className = 'edit-button'>
                    <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}));}}>edit</button>
                  </span>
                }
                <span className = 'modify-stuff' id = 'line'>&nbsp;|&nbsp;</span>
                <button className = 'modify-stuff delete-button' onClick={() => {handleDeleteCard(id);}}>delete</button>
              </div>
          }
        </div>
      </div>
    );
  }
}

class DeckTitle extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      originalDeckName: props.deckName.slice(0),
      newDeckName: props.deckName.slice(0)
    };

    this.handleToggleUpdate = this.handleToggleUpdate.bind(this);
    this.handleUpdateDeck = this.handleUpdateDeck.bind(this);
    this.handleChangeNewDeckName = this.handleChangeNewDeckName.bind(this);
  }

  handleChangeNewDeckName(e) {
    const value = e.target.value;
    this.setState(() => ({
      newDeckName: value
    }));
  }

  handleToggleUpdate() {
    this.setState((prevState) => ({
      isUpdate: !prevState.isUpdate
    }));
  }

  handleUpdateDeck() {
    updateCurrentUserDeck(this.props.deckId, this.state.newDeckName).then(() => {
      this.setState((prevState) =>({
        originalDeckName: prevState.newDeckName,
        isUpdate: false
      }));
    }).catch((err) => {
      console.log(err);
      alert(err);
    });
  }

  render() {
    const { isUpdate, originalDeckName, newDeckName } = this.state;
    const { creatorName, userIsOwner, numberOfCards } = this.props;
    return (
      <div>
        {isUpdate
          ? <input type='text'
            maxLength='150'
            className = 'deck-title'
            value = {newDeckName}
            onChange = {this.handleChangeNewDeckName}
            placeholder = 'title your deck here' 
          />
          : <p className = 'deck-title edit-title'>{originalDeckName}</p>}
        <div className = 'inline-display center-subtitle'>
          <p className = 'small-caption'>created by {creatorName} | 
            {numberOfCards} {numberOfCards === 1 ? 'card' : 'cards'} 
            {userIsOwner && <span>|</span>}</p>
          {userIsOwner && (
            isUpdate
              ? <span>
                <button onClick={this.handleUpdateDeck} className = 'small-caption change-title'>&nbsp;update</button>
                <button onClick={this.handleToggleUpdate} className = 'small-caption change-title'>&nbsp;cancel</button>
              </span>
              : <button onClick={this.handleToggleUpdate} className = 'small-caption change-title'>&nbsp;change deck title</button>
          )}
        </div>
      </div>
    );
  }
}

class AddCardForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addCardFrontName: '',
      addCardBackName: ''
    };

    this.handleAddCard = this.handleAddCard.bind(this);
    this.handleChangeAddCardFront = this.handleChangeAddCardFront.bind(this);
    this.handleChangeAddCardBack = this.handleChangeAddCardBack.bind(this);
  }

  handleAddCard(e) {
    e.preventDefault();
    const { addCardFrontName, addCardBackName } = this.state;
    const { callback, deckId } = this.props;
    const cardFront = addCardFrontName.trim();
    const cardBack = addCardBackName.trim();

    if (cardFront && cardBack) {
      createCard(cardFront, cardBack, deckId)
        .then(() => {
          if (callback) {
            callback();
          }
          this.setState(() => ({
            addCardBackName: '',
            addCardFrontName: ''
          }));
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('One of your inputs is empty. Check your inputs and try again.');
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
    const { addCardFrontName, addCardBackName } = this.state;
    return (
      <form onSubmit={this.handleAddCard}>
        <p id = 'add-a-card'>add a card:</p>
        <div className = 'needs-padding'>
          <div className = 'flashcard add-card'>
            <TextareaAutosize
              placeholder='front information'
              className = 'flashcard-text'
              type='text'
              maxLength='1000'
              autoComplete='off'
              value={addCardFrontName}
              onChange={this.handleChangeAddCardFront} />
            <img className = 'switch-front-and-back' src = {require('../resources/flashcard-img/switch.png')} />
            <TextareaAutosize
              placeholder='back information'
              maxLength='1000'
              className = 'flashcard-text'
              type='text'
              autoComplete='off'
              value={addCardBackName}
              onChange={this.handleChangeAddCardBack} />
            <button type='submit' className = 'add'>add</button>
          </div>
        </div>
      </form>
    );
  }
}

class Deck extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      deckName: '',
      cards: [],
      creatorName: '',
      userIsOwner: false,
      isLoading: true,
      periods: {}
    };

    this.handleDeleteCard = this.handleDeleteCard.bind(this);
    this.doUpdateCard = this.doUpdateCard.bind(this);
    this.updateDeck = this.updateDeck.bind(this);
    this.submitDelete = this.submitDelete.bind(this);
    this.handleDeleteDeck = this.handleDeleteDeck.bind(this);
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
  }

  componentDidMount() {
    this.updateDeck();
  }

  async updateDeck() {
    const { id } = this.props.match.params;
    const { state, pathname } = this.props.location;
    try {
      // determine if this is a classroom deck
      let periodsState = {};
      if (state && state.isForClassroom
          && state.classroomId != null
          && pathname === routes.teacher.getViewDeckEditRoute(state.classroomId, id)) {
        const classroomInfo = await getClassroomInfo(state.classroomId);
        classroomInfo.periods.forEach((pd) => {
          periodsState[pd] = false;
        });
      }

      let deck = await getDeck(id);
      const { deckName, creatorId, cards, periods } = deck;
      let profileInfo = await getUserProfileInfo(creatorId);
      let creatorName = profileInfo.data().name;
      const currentUser = firebase.auth().currentUser;

      // set periods in this deck's periods to be true in periodsState
      if (periods != null) {
        Object.keys(periods).forEach((pdkey) => {
          if (periods[pdkey]) {
            periodsState[pdkey] = true;
          }
        });
      }
      this.setState(() => ({
        deckName: deckName,
        creatorName: creatorName,
        userIsOwner: currentUser != null && creatorId === currentUser.uid,
        cards: cards,
        isLoading: false,
        periods: periodsState
      }));
    } catch(err) {
      alert('Our apologies -- there was an error!');
      console.error(err);
    }
  }

  async handleDeleteCard(cardId) {
    const { id } = this.props.match.params;
    try {
      await deleteCard(id, cardId);
    } catch(err) {
      console.log(err);
    }
    this.updateDeck();
  }

  doUpdateCard(cardId, front, back) {
    const { id } = this.props.match.params;
    updateCard(id, cardId, front, back).then(() => {
      this.updateDeck();
    }).catch((err) => {
      console.log(err);
    });
  }

  handleDeleteDeck() {
    const { id } = this.props.match.params;
    this.setState(() => ({
      isLoading: true
    }), () => {
      deleteDeckFromCurrentUser(id).then(() => {
        this.props.history.push(routes.dashboard.base);
      }).catch((err) => {
        console.log(err);
        alert(err);
      });
    });
  }

  handlePeriodChange(e) {
    e.persist();
    this.setState((prevState) => {
      const newPeriods = prevState.periods;
      newPeriods[e.target.name] = e.target.checked;
      return {
        periods: newPeriods
      };
    });
  }

  submitDelete() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui'>
            <h1 className = 'delete-deck-confirm'>are you sure you want to delete this deck?</h1>
            <h1 className = 'delete-deck-confirm' id = 'small-confirm'>this action cannot be undone.</h1>
            <div className = 'inline-display center-subtitle'>
              <button className = 'no-button'onClick={onClose}>no</button>
              <button className = 'yes-button' onClick={() => {
                this.handleDeleteDeck();
                onClose();
              }}>yes</button>
            </div>
          </div>
        );
      }
    });
  }

  render() {
    const { isLoading, deckName, creatorName, cards, userIsOwner, periods } = this.state;
    const { id } = this.props.match.params;
    let isForClassroom;
    if (this.props.location.state) {
      ({ isForClassroom } = this.props.location.state);
    }
    const numberOfCards = cards.length;

    return isLoading
      ? <BigLoading />
      : (
        <div>
          <div className = 'deck-info'>
            { isForClassroom
              ? <BackButton redirectTo={routes.teacher.dashboard} destination='dashboard' />
              : <BackButton redirectTo={routes.dashboard.base} destination='dashboard' /> }
            <DeckTitle
              userIsOwner={userIsOwner}
              creatorName={creatorName}
              deckName={deckName}
              numberOfCards={numberOfCards}
              deckId={id} />
          </div>

          <div className='soft-blue-background'>
            { isForClassroom
              ? null
              : <Link id = 'study-deck' to={routes.study.getDeckRoute(id)}>
                <button className = 'primary-button'>study this deck</button>
              </Link>}
            { userIsOwner && <AddCardForm deckId={id} callback={this.updateDeck} /> }
          
            {cards.map((card) => 
              <Card 
                userIsOwner={userIsOwner}
                id={card.id} 
                front={card.front} 
                back={card.back} 
                doUpdateCard={this.doUpdateCard}
                handleDeleteCard={this.handleDeleteCard} 
                key={card.id} />
            )}

            {isForClassroom
              && <SelectPeriods deckId={id} periods={periods} handlePeriodChange={this.handlePeriodChange} /> }

            <div className = 'inline-display center-subtitle'>
              <button className = 'red delete-deck' onClick = {this.submitDelete}> 
                delete this deck
              </button>
            </div>
          </div>
        </div>
      );
  }
}

export default Deck;

Deck.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      classroomId: PropTypes.string,
      isForClassroom: PropTypes.bool
    }),
    pathname: PropTypes.string.isRequired
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
AddCardForm.propTypes = {
  callback: PropTypes.func,
  deckId: PropTypes.string.isRequired
};
Card.propTypes = {
  userIsOwner: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  back: PropTypes.string.isRequired,
  doUpdateCard: PropTypes.func.isRequired,
  handleDeleteCard: PropTypes.func.isRequired,
};
DeckTitle.propTypes = {
  deckName: PropTypes.string.isRequired,
  creatorName: PropTypes.string.isRequired,
  deckId: PropTypes.string.isRequired,
  userIsOwner: PropTypes.bool.isRequired,
  numberOfCards: PropTypes.number.isRequired,
};
SelectPeriods.propTypes = {
  periods: PropTypes.object.isRequired,
  deckId: PropTypes.string.isRequired,
  handlePeriodChange: PropTypes.func.isRequired
};