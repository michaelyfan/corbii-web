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
      isFlipped: false
    }
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
      this.setState(() => ({
        name: result.deckName,
        cards: result.cards,
        studiedCards: result.studiedCards
      }))
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
            {this.state.content}
          </p>
          <button onClick={this.flip}></button>

          <button onClick={() => {this.changeIndex(true)}}>Next card</button>
        </div>
      </div>
    )
  }
}

StudyDeck.propTypes = {
  
}

export default StudyDeck;