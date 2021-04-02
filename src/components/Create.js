import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { confirmAlert } from 'react-confirm-alert';
import { createDeckCurrentUser } from '../utils/api';
import routes from '../routes/routes';
import TextareaAutosize from 'react-autosize-textarea';

// image assets
import trashImg from '../resources/flashcard-img/trash.png';
import switchImg from '../resources/flashcard-img/switch.png';

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
          <img style={{cursor: 'pointer'}} onClick={this.handleSwitch} className = 'switch-front-and-back' src = {switchImg} />
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
          <img style={{cursor: 'pointer'}} onClick={this.handleDelete} className = 'side-options' src = {trashImg} />
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
          )}
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

class Create extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      title: '',
    };

    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleCreateDeck = this.handleCreateDeck.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  handleChangeTitle(e) {
    e.persist();
    this.setState(() => ({
      title: e.target.value
    }));
  }

  handleCreateDeck(cards) {
    const { title } = this.state;
    if (title.trim() === '') {
      alert('Title cannot be empty.');
    } else if (this.hasEmptyEntries('decks', cards)) {
      alert('One or more of your card entries is empty.');
    } else {
      createDeckCurrentUser({
        deckName: title, 
        cards: cards,
      }).then(() => {
        this.props.history.push(routes.dashboard.base);
      }).catch((err) => {
        console.error(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      });
    }
  }

  hasEmptyEntries(type, content) {
    for (let i = 0; i < content.length; i++) {
      let item = content[i];
      if (item.front.trim() === '' || item.back.trim() === '') {
        return true;
      }
    }
    return false;
  }

  handleGoBack() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui'>
            <h1 className = 'delete-deck-confirm'>are you sure you want to go back?</h1>
            <h1 className = 'delete-deck-confirm' id = 'small-confirm'>this will delete your deck in progress.</h1>
            <div className = 'inline-display center-subtitle'>
              <button className = 'no-button' onClick={onClose}>no</button>
              <button className = 'yes-button' onClick={() => {
                this.props.history.push(routes.dashboard.base);
                onClose();
              }}>yes</button>
            </div>
          </div>
        );
      }
    });
  }

  render() {
    const { title } = this.state;
    return (
      <div id='create-wrapper'>
        <div className = 'deck-info'>
          <button className = 'back-to-deck' onClick = {this.handleGoBack}>back to dashboard</button>
          <input type='text'
            maxLength='150'
            className = 'deck-title'
            onChange={this.handleChangeTitle}
            value={title}
            placeholder='deck title'
          />
        </div>

        <div className = 'button-wrapper'>
          <div className = 'create-buttons'>
            <CreateDeck handleCreateDeck={this.handleCreateDeck} />
          </div>
        </div>
      </div>
    );
  }
}

Create.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
CreateDeck.propTypes = {
  handleCreateDeck: PropTypes.func.isRequired
};
CreateDeckCard.propTypes = {
  initialFront: PropTypes.string.isRequired,
  initialBack: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  save: PropTypes.func.isRequired,
  switch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired
};
export default Create;