import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import routes from '../../routes/routes';
import BackButton from '../reusables/BackButton';
import {Link} from 'react-router-dom';
import { getClassroomInfo, getDeckInfo, getCardsInfo } from '../../utils/api.js';
import { getPeriodCardsMissedMost, getPeriodCardAverage } from '../../utils/teacherapi.js';

function LowRatedCard(props) {
  const { deckName, front, rating } = props;

  return (
    <div className = 'card-info inline-display'>
      <h1 className = 'score'> {rating} </h1>
      <div className= 'nav'>
        <h3 className = 'question'> {front} </h3>
        <h4 className = 'deck-from'> in
          <span className = 'italics'> {deckName} </span>
        </h4>
      </div>
    </div>
  );
}

LowRatedCard.propTypes = {
  deckName: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
};

class PeriodTeacherView extends React.Component {

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
      classroomName: 'Loading...',
      cardsMissedMost: [],
      averageRatingPerCard: 0
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  async getInfo() {
    const { id, period } = this.props.match.params;
    if (id == null) {
      this.props.history.push(routes.teacherDashboard);
    }

    let averageRating, classroomInfo, missedCards, cardsInfo, deckInfos;
    try {
      // get card average, classroom info, and cards missed most
      ([ averageRating, classroomInfo, missedCards ] = await Promise.all([
        getPeriodCardAverage(id, period),
        getClassroomInfo(id),
        getPeriodCardsMissedMost(id, period)
      ]));
      cardsInfo = await getCardsInfo(missedCards);

      // get missed cards' decks' names
      const deckNameCalls = [];
      missedCards.forEach((cardObj) => {
        deckNameCalls.push(getDeckInfo(cardObj.deckId));
      });
      deckInfos = await(Promise.all(deckNameCalls));
    } catch (e) {
      alert('Apologies -- there was an error!');
      console.error(e);
    }

    // create cardsMissedMost state object from missedCards, using deckInfos for deck names and
    //    cardsInfo for card front
    let cardsMissedMostState = [];
    missedCards.forEach((cardObj, i) => {
      cardsMissedMostState.push({
        deckName: deckInfos[i].name,
        front: cardsInfo[cardObj.cardId].front,
        rating: cardObj.averageQuality
      });
    });

    this.setState(() => ({
      classroomName: classroomInfo.name,
      averageRatingPerCard: averageRating,
      cardsMissedMost: cardsMissedMostState
    }));
  }

  render() {
    const { id, period } = this.props.match.params;
    const { classroomName, averageRatingPerCard, cardsMissedMost } = this.state;


    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={`${routes.teacherViewClassroom}/${id}`} destination='classroom' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{classroomName} - period {period}</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <div className = 'navigation'>
              <Link to={{
                pathname: routes.teacherCreate,
                state: {
                  isForClassroom: true,
                  classroomId: id
                }
              }}>
                <button className = 'dash-nav'>
                    create a new deck
                </button>
              </Link>
              <br />
              <Link to={`${routes.teacherViewStudents}/${id}`}>
                <button className = 'dash-nav'>view student analytics</button>
              </Link>
              <br />
              <Link to={routes.teacherDashboard}>
                <button className = 'dash-nav'>view deck analytics</button>
              </Link>
            </div>
          </div>

          <div className = 'active-view'>
            <div className= 'needs-border'>
              {/*
              <h3 className = 'studied-header'> 
                <span className = 'percent-emph'>{}% </span>
                of your students are caught up on studying. 
              </h3>
              */}

              <div className = 'inline-display center-button'>
                <div className = 'classroom-basic'>
                  <h2 className = 'class-stat-title'> average rating per card </h2>
                  <h2 className = 'class-stats'> {averageRatingPerCard} </h2>
                </div>
              </div>
            </div>

            <div className = 'low-card'>
              <h2 className = 'low-card-header'>lowest rated cards</h2>
              {cardsMissedMost.length === 0
                ? <p>You don&apos;t have any data yet! Try making a deck, and encourage your students to study.</p>
                : cardsMissedMost.map((card) => {
                  return <LowRatedCard deckName={card.deckName} front={card.front} rating={card.rating} key={shortid.generate()} />;
                })}
            </div>

            {/*
              <div className = 'low-card'>
                <h2 className = 'low-card-header'>highest rated cards</h2>
                <div className = 'card-info inline-display'>
                  <h1 className = 'score'> # </h1>
                  <div className= 'nav'>
                    <h3 className = 'question'> card front here </h3>
                    <h4 className = 'deck-from'> in
                      <span className = 'italics'> deck title here </span>
                    </h4>
                  </div>
                </div>
              </div>
            */}

          </div>
        </div>
      </div>
    );
  }
}


export default PeriodTeacherView;