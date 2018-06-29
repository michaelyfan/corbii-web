import React from 'react';
import PropTypes from 'prop-types';
import { getDeckForStudy } from '../utils/api';
import queryString from 'query-string';

class StudyCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      front: '',
      back: '',
      isFlipped: false
    }
  }

  render() {
    return (
      <div className='study-card'>
        <p>
          { this.state.isFlipped
              ? this.state.back
              : this.state.front
          }
        </p>
      </div>
      <button onClick={this.flip}>Flip card</button>
      { this.state.isFlipped 
        ? <div>
            <button onClick={() => {this.submitCard(0)}}>1</button>
            <button onClick={() => {this.submitCard(1)}}>2</button>
            <button onClick={() => {this.submitCard(2)}}>3</button>
            <button onClick={() => {this.submitCard(3)}}>4</button>
            <button onClick={() => {this.submitCard(4)}}>5</button>
            <button onClick={() => {this.submitCard(5)}}>6</button>
          </div>
        : null}
    )
  }

}



class StudyDeck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      index: 0,
      isFlipped: false,
      arrayTodo: [],
      arrayLeft: []
      personalData: null,
    }

    this.flip = this.flip.bind(this);
    this.changeIndex = this.changeIndex.bind(this);
    this.submitCard = this.submitCard.bind(this);
  }

  componentDidMount() {
    if (this.props.signedIn) {
      this.getDeck();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.signedIn === true && this.props.signedIn != prevProps.signedIn) {
      this.getDeck();
    }
  }

  changeIndex(isDecrement) {
    if (isDecrement) {
      this.setState((prevProps) => ({index: prevProps.index - 1}));
    } else {
      this.setState((prevProps) => ({index: prevProps.index + 1}));
    }
  }

  getDeck() {
    const { d } = queryString.parse(this.props.location.search);
    getDeckForStudy(d).then((result) => {
      console.log(result);
      const [ arrayDue, arrayNew, arrayLeft, personalData ] = result;
      this.setState(() => ({
        arrayTodo: arrayDue.concat(arrayNew)
        arrayLeft: arrayLeft,
        personalData: personalData
      }), this.updateContent);
    }).catch((err) => {
      console.error(err);
    });
  }

  submitCard() {
    
  }

  flip() {
    this.setState((prevState) => ({isFlipped: !prevState.isFlipped}))
  }

  render() {
    return (
      <div>
        <h1>{this.state.name}</h1>
        <StudyCard card={this.state.arrayTodo[index]} />
        
        <div>
          {this.state.index >= this.state.cards.length - 1
            ? null
            : <button onClick={() => {this.changeIndex(false)}}>Next card</button>}
        </div>
        

      </div>
    )
  }
}

StudyDeck.propTypes = {
  
}

export default StudyDeck;