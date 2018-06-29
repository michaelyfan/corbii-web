import React from 'react';
import PropTypes from 'prop-types';
import { getDeckForStudy } from '../utils/api';
import queryString from 'query-string';

class StudyDeck extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      cards: [],
      studiedCards: null,
      index: 0,
      front: '',
      back: '',
      isFlipped: false
    }

    this.flip = this.flip.bind(this);
    this.changeCard = this.changeCard.bind(this);
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

  changeCard(isDecrement) {
    if (isDecrement) {
      this.setState((prevProps) => ({index: prevProps.index - 1}), this.updateContent);
    } else {
      this.setState((prevProps) => ({index: prevProps.index + 1}), this.updateContent);
    }
  }

  updateContent() {
    console.log('here1', this.state.index);

    const front = this.state.cards[this.state.index].front;
    const back = this.state.cards[this.state.index].back;
    this.setState(() => ({
      front: front,
      back: back
    }));
  }

  getDeck() {
    const { d } = queryString.parse(this.props.location.search);
    getDeckForStudy(d).then((result) => {
      console.log(result);
      this.setState(() => ({
        name: result.deckName,
        cards: result.cards,
        studiedCards: result.studiedCards
      }), this.updateContent);
    }).catch((err) => {
      console.error(err);
    });
  }

  flip() {
    this.setState((prevState) => ({isFlipped: !prevState.isFlipped}))
  }

  render() {
    return (
      <div>
        <h1>{this.state.name}</h1>
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
              <button onClick={() => {this.submitCard(0)}}>Cuddly</button>
              <button onClick={() => {this.submitCard(1)}}>Soft</button>
              <button onClick={() => {this.submitCard(2)}}>Uncomfortable</button>
              <button onClick={() => {this.submitCard(3)}}>Painful</button>
              <button onClick={() => {this.submitCard(4)}}>Excrutiating</button>
              <button onClick={() => {this.submitCard(5)}}>Deadly</button>
            </div>
          : null}
        <div>
          {this.state.index >= this.state.cards.length - 1
            ? null
            : <button onClick={() => {this.changeCard(false)}}>Next card</button>}
        </div>
        

      </div>
    )
  }
}

StudyDeck.propTypes = {
  
}

export default StudyDeck;