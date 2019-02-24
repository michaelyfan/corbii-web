import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { confirmAlert } from 'react-confirm-alert';
import { createDeckCurrentUser, createConceptListCurrentUser, getClassroomInfo } from '../utils/api';
import routes from '../routes/routes';
import TextareaAutosize from 'react-autosize-textarea';

function SelectPeriods(props) {
  const { periods, handlePeriodChange } = props;
  return (
    <div>
      <p>Select the periods you&apos;d like to assign this deck to.</p>
      <form>
        {Object.keys(periods).map((period) =>
          <label key={period}> Period {period}:
            <input
              name={period}
              type='checkbox'
              checked={periods[period]}
              onChange={handlePeriodChange} />
          </label>
        )}
      </form>
    </div>
  );
}

class CreateDeckCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Below is normally bad practice, but this use case is valid.
      front: props.initialFront,
      back: props.initialBack
    };

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
      }));
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
          maxLength='1000'
          className = 'flashcard-text'
          key='front'
          value={this.state.front}
          onChange={(e) => {this.handleChange('front', e);}}
          onBlur={this.handleSave}
          placeholder='front' />
        <div className = 'side-menu'>
          <img style={{cursor: 'pointer'}} onClick={this.handleSwitch} className = 'switch-front-and-back' src = '../src/resources/flashcard-img/switch.png' />
        </div>
        <TextareaAutosize 
          type='text'
          className = 'flashcard-text'
          maxLength='1000'
          key='back'
          value={this.state.back}
          onChange={(e) => {this.handleChange('back', e);}}
          onBlur={this.handleSave}
          placeholder='back' />

        <div className = 'side-menu'>
          <img style={{cursor: 'pointer'}} onClick={this.handleDelete} className = 'side-options' src = '../src/resources/flashcard-img/trash.png' />
        </div>
      </div>
    );
  }
}

class CreateConceptCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Below is normally bad practice, but this use case is valid.
      question: props.initialQuestion,
    };

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
          id = 'create-a-concept'
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
    );
  }
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
    };

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
      };
    });
  }

  deleteCard(index) {
    this.setState((prevState) => {
      let cards = prevState.cards;
      cards.splice(index, 1);
      return {
        cards: cards
      };
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
      };

      return {
        cards: cards
      };
    });
  }

  switch(index) {
    this.setState((prevState) => {
      let cards = prevState.cards;
      let temp = cards[index].front;
      cards[index].front = cards[index].back;
      cards[index].back = temp;
      return {
        cards: cards
      };
    });
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
              onClick={() => {this.props.handleCreateDeck(this.state.cards);}}
              className = 'primary-button'
              id = 'finalize-deck'>
                create deck
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class CreateList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      concepts: [{
        question: '',
        id: shortid.generate()
      }]
    };

    this.handleAddConcept = this.handleAddConcept.bind(this);
    this.deleteConcept = this.deleteConcept.bind(this);
    this.save = this.save.bind(this);
  }

  handleAddConcept() {
    this.setState((prevState) => {
      const concepts = prevState.concepts;
      concepts.push({
        question: '',
        id: shortid.generate()
      });
      return {
        concepts: concepts
      };
    });
  }

  deleteConcept(index) {
    this.setState((prevState) => {
      let concepts = prevState.concepts;
      concepts.splice(index, 1);
      return {
        concepts: concepts,
      };
    });
  }

  save(index, newQuestion) {
    this.setState((prevState) => {
      const concepts = prevState.concepts;
      const oldConcept = concepts[index];
      concepts[index] = {
        id: oldConcept.id,
        question: newQuestion
      };

      return {
        concepts: concepts
      };
    });
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
              onClick={() => {this.props.handleCreateList(this.state.concepts);}}
              className = 'primary-button'
              id = 'finalize-list'>
                create list
            </button>
          </div>
        </div>        
      </div>
    );
  }
}

class Create extends React.Component {

  constructor(props) {
    super(props);

    /*
     * periods has the format:
       {
         '1': true,
         '2': false,
         etc...
         '<period number here>': boolean
       }
     */
    this.state = {
      isList: false,
      title: '',
      isForClassroom: false,
      periods: {},
      classroomId: ''
    };

    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleCreateList = this.handleCreateList.bind(this);
    this.handleCreateDeck = this.handleCreateDeck.bind(this);
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  componentDidMount() {
    this.determineClassroom();
  }

  async determineClassroom() {
    const routeState = this.props.location.state;
    if (this.props.location.pathname === routes.teacher.create
        && routeState
        && routeState.isForClassroom
        && routeState.classroomId != null) {
      try {
        // get this classroom's periods to display in SelectPeriods
        const classroomInfo = await getClassroomInfo(routeState.classroomId);
        const periodState = {}; 
        classroomInfo.periods.forEach((pd) => {
          periodState[pd] = true;
        });
        this.setState(() => ({
          isForClassroom: true,
          classroomId: routeState.classroomId,
          periods: periodState
        }));
      } catch (e) {
        console.error(e);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${e}`);
      }
    }
  }

  handleChangeTitle(e) {
    e.persist();
    this.setState(() => ({
      title: e.target.value
    }));
  }

  handleCreateList(concepts) { 
    if (this.state.title.trim() === '') {
      alert('Title cannot be empty.'); 
    } else if (this.hasEmptyEntries('concepts',concepts)) {
      alert('One or more of your concepts is empty.');
    } else {
      createConceptListCurrentUser(this.state.title, concepts).then(() => {
        this.props.history.push(routes.dashboard.base);
      }).catch((err) => {
        console.error(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      });
    }
  }

  handleCreateDeck(cards) {
    const { title, isForClassroom, classroomId, periods } = this.state;
    const validPeriods = Object.keys(periods).filter(pd => periods[pd]);
    if (title.trim() === '') {
      alert('Title cannot be empty.');
    } else if (this.hasEmptyEntries('decks', cards)) {
      alert('One or more of your card entries is empty.');
    } else if (isForClassroom && classroomId != null && validPeriods.length == 0) {
      alert('You must select at least one period to assign this deck to.');
    } else {
      createDeckCurrentUser({
        deckName: title, 
        cards: cards,
        isForClassroom: isForClassroom,
        classroomId: classroomId,
        periods: validPeriods
      }).then(() => {
        if (isForClassroom) {
          this.props.history.push(routes.teacher.getViewClassroomRoute(classroomId));
        } else {
          this.props.history.push(routes.dashboard.base);
        }
      }).catch((err) => {
        console.error(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
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

  handleGoBack() {
    const { isForClassroom, classroomId } = this.state;
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui'>
            <h1 className = 'delete-deck-confirm'>are you sure you want to go back?</h1>
            <h1 className = 'delete-deck-confirm' id = 'small-confirm'>this will delete your deck in progress.</h1>
            <div className = 'inline-display center-subtitle'>
              <button className = 'no-button' onClick={onClose}>no</button>
              <button className = 'yes-button' onClick={() => {
                if (isForClassroom) {
                  this.props.history.push(routes.teacher.getViewClassroomRoute(classroomId));
                } else {
                  this.props.history.push(routes.dashboard.base);
                }
                onClose();
              }}>yes</button>
            </div>
          </div>
        );
      }
    });
  }

  render() {
    const { title, isList, periods, isForClassroom } = this.state;
    return (
      <div>
        <button className = 'back-to-deck' onClick = {this.handleGoBack}>back to dashboard</button>
        <div className = 'deck-info'>
          <input type='text'
            maxLength='150'
            className = 'deck-title'
            onChange={this.handleChangeTitle}
            value={title}
            placeholder =
              { isList 
                ? 'title your list here'
                : 'title your deck here'
              }
          />

          <p className = 'small-caption' id = 'deck-subtitle'>
            { isList 
              ? 'concept list title'
              : 'deck title'
            } 
          </p>
        </div>

        <div className = 'button-wrapper'>
          <div className = 'create-buttons'>
            { !isForClassroom
              && <div>
                <button className = 'create-type' onClick={() => {this.setState(() => ({isList: false}));}}>create a study deck</button>
                <button className = 'create-type' onClick={() => {this.setState(() => ({isList: true}));}}>create a concept list</button>
              </div> }
            { isList 
              ? <CreateList handleCreateList={this.handleCreateList} />
              : <CreateDeck handleCreateDeck={this.handleCreateDeck} />
            }
          </div>
        </div>

        {isForClassroom
          && <SelectPeriods periods={periods} handlePeriodChange={this.handlePeriodChange} /> }
      </div>
    );
  }
}

Create.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      isForClassroom: PropTypes.bool,
      classroomId: PropTypes.string
    }),
    pathname: PropTypes.string.isRequired
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
CreateDeck.propTypes = {
  handleCreateDeck: PropTypes.func.isRequired
};
CreateList.propTypes = {
  handleCreateList: PropTypes.func.isRequired
};
CreateDeckCard.propTypes = {
  initialFront: PropTypes.string.isRequired,
  initialBack: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  save: PropTypes.func.isRequired,
  switch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired
};
CreateConceptCard.propTypes = {
  initialQuestion: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  save: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired
};
SelectPeriods.propTypes = {
  periods: PropTypes.object.isRequired,
  handlePeriodChange: PropTypes.func.isRequired
};

export default Create;