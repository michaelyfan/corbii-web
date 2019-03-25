import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

function LowRatedCard(props) {
  const { deckName, front, rating } = props;

  return (
    <div className = 'card-info inline-display'>
      <h1 className = 'score'> {rating.toFixed(2)} </h1>
      <div className= 'nav'>
        <h3 className = 'question'> {front} </h3>
        <h4 className = 'deck-from'> in
          <span className = 'italics'> {deckName} </span>
        </h4>
      </div>
    </div>
  );
}

class LowRatedCards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      quantityFilter: null
    };
  }

  render() {
    const { cards, description } = this.props;
    const { quantityFilter } = this.state;

    // sort the cards from worst to best
    cards.sort((card1, card2) => {
      return card1.rating - card2.rating;
    });

    let arrayToRender;
    if (quantityFilter == null) {
      arrayToRender = cards;
    } else {
      arrayToRender = cards.slice(0, quantityFilter);
    }
    return (
      <div className = 'low-card'>
        <h2 className = 'low-card-header'>{description}</h2>
        <div>
          <span className =  'filter-prompt'>number of cards to show:</span>
          <button className = 'view-filter-button' onClick={() => {this.setState(() => ({ quantityFilter: null }));}}>all</button>
          <button className = 'view-filter-button' onClick={() => {this.setState(() => ({ quantityFilter: 5 }));}}>5</button>
          <button className = 'view-filter-button' onClick={() => {this.setState(() => ({ quantityFilter: 10 }));}}>10</button>
          <button className = 'view-filter-button' onClick={() => {this.setState(() => ({ quantityFilter: 20 }));}}>20</button>
        </div>
        {arrayToRender.length === 0
          ? <p>No data to see here -- maybe you should make more decks?</p>
          : arrayToRender.slice().map((card) => {
            return <LowRatedCard deckName={card.deckName} front={card.front} rating={card.rating} key={shortid.generate()} />;
          })}
      </div>
    );
  }
  
}

LowRatedCards.propTypes = {
  cards: PropTypes.array.isRequired,
  description: PropTypes.string.isRequired
};
LowRatedCards.defaultProps = {
  description: 'cards missed most'
};
LowRatedCard.propTypes = {
  deckName: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
};

export default LowRatedCards;