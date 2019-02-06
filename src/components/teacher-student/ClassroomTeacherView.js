import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import shortid from 'shortid';
import BackButton from '../reusables/BackButton';
import routes from '../../routes/routes';
import TeacherSidebar from './TeacherSidebar';
import { getClassroomInfo, getDeckInfo, getCardsInfo } from '../../utils/api.js';
import { getClassDataRaw, getCardsMissedMost, getCardAverage } from '../../utils/teacherapi.js';

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

function PeriodLink(props) {
  const { id, period } = props;
  return (
    <span>
      <Link to={routes.teacher.getViewPeriodRoute(id, period)}>
        <button className='dash-nav'>period {period}</button>
      </Link>
      <br />
    </span>
  );
}

class ClassroomTeacherView extends React.Component {

  constructor(props) {
    super(props);

    /**
     * cardsMissedMost has the structure:
     * {
     *   deckName: '',
     *   front: '',
     *   rating: ''
     * }
     */
    this.state = {
      name: 'Loading...',
      periods: [],
      cardsMissedMost: [],
      averageRatingPerCard: 0
    };
  }

  async componentDidMount() {
    this.getInfo();
  }

  async getInfo() {
    const { id } = this.props.match.params;

    // get necessary info for this view
    try {
      // get class data points
      const data = await getClassDataRaw(id);
      // get card average, worst cards, and classroomInfo
      const [ average, missedCards, classInfo ] = await Promise.all([
        getCardAverage(null, data),
        getCardsMissedMost(null, data),
        getClassroomInfo(id)
      ]);
      // get worst cards' content
      const cardsInfo = await getCardsInfo(missedCards);
      // get worst cards' decks' names
      const deckNameCalls = [];
      missedCards.forEach((cardObj) => {
        deckNameCalls.push(getDeckInfo(cardObj.deckId));
      });
      const decksInfo = await(Promise.all(deckNameCalls));

      // create cardsMissedMost state object from missedCards, decksInfo, and cardsInfo
      let cardsMissedMostState = [];
      missedCards.forEach((cardObj, i) => {
        cardsMissedMostState.push({
          deckName: decksInfo[i].name,
          front: cardsInfo[cardObj.cardId].front,
          rating: cardObj.averageQuality
        });
      });
      
      this.setState(() => ({
        name: classInfo.name,
        averageRatingPerCard: average,
        periods: classInfo.periods,
        cardsMissedMost: cardsMissedMostState
      }));
    } catch (e) {
      alert('Apologies -- there was an error!');
      console.error(e);
    }

  }

  render() {
    const { id } = this.props.match.params;
    const { name, periods, averageRatingPerCard, cardsMissedMost } = this.state;

    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.dashboard} destination='dashboard' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{name}</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={id} periods={periods} />
          </div>

          <div className = 'active-view'>
            <div className= 'needs-border'>
              <div className = 'inline-display center-button'>
                <div className = 'classroom-basic'>
                  <h2 className = 'class-stat-title'> average rating per card </h2>
                  <h2 className = 'class-stats'> {averageRatingPerCard.toFixed(2)} </h2>
                </div>
              </div>
            </div>

            <div className = 'low-card'>
              <h2 className = 'low-card-header'>cards missed most</h2>
              {cardsMissedMost.length === 0
                ? <p>You don&apos;t have any data yet! Try making a deck, and encourage your students to study.</p>
                : cardsMissedMost.map((card) => {
                  return <LowRatedCard deckName={card.deckName} front={card.front} rating={card.rating} key={shortid.generate()} />;
                })}
              
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ClassroomTeacherView;

ClassroomTeacherView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  })
};

PeriodLink.propTypes = {
  period: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};

LowRatedCard.propTypes = {
  deckName: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
};