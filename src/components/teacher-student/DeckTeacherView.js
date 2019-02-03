/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

/* Required modules */
import BackButton from '../reusables/BackButton';
import TeacherSidebar from './TeacherSidebar';
import routes from '../../routes/routes';
import { getCardsMissedMost, getCardAverage } from '../../utils/teacherapi.js';
import { getClassroomInfo, getCardsInfo, getDeckInfo } from '../../utils/api.js';

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

class DeckTeacherView extends React.Component {

  constructor(props) {
    super(props);
    /**
     * consistentLowCards has the structure:
     * {
     *   deckName: '',
     *   front: '',
     *   rating: ''
     * }
     *
     *
     */
    this.state = {
      classroomName: 'Loading...',
      periods: [],
      deckName: 'Loading...',
      deckPeriods: [],
      count: 0,
      averageRating: 0,
      cardsMissedMost: []
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  async getInfo() {
    const { classroomId, deckId } = this.props.match.params;

    try {
      const [ cardsMissedMost, deckInfo, classroomInfo, averageRating ] = await Promise.all([
        getCardsMissedMost(classroomId, null, deckId),
        getDeckInfo(deckId),
        getClassroomInfo(classroomId),
        getCardAverage(classroomId, null, deckId),
      ]);
      const cardsInfo = await getCardsInfo(cardsMissedMost);
      
      // get missed cards' decks' names
      const deckNameCalls = [];
      cardsMissedMost.forEach((cardObj) => {
        deckNameCalls.push(getDeckInfo(cardObj.deckId));
      });
      const deckInfos = await Promise.all(deckNameCalls);

      // create cardsMissedMost state object from cardsMissedMost, using deckInfos for deck
      //    names and cardsInfo for card front
      let cardsMissedMostState = [];
      cardsMissedMost.forEach((cardObj, i) => {
        cardsMissedMostState.push({
          deckName: deckInfos[i].name,
          front: cardsInfo[cardObj.cardId].front,
          rating: cardObj.averageQuality
        });
      });

      this.setState(() => ({
        classroomName: classroomInfo.name,
        periods: classroomInfo.periods,
        deckName: deckInfo.name,
        deckPeriods: Object.keys(deckInfo.periods),
        count: deckInfo.count,
        averageRating: averageRating,
        cardsMissedMost: cardsMissedMostState,
      }));
    } catch (e) {
      alert('Apologies -- there was an error!');
      console.error(e);
    }
  }

  render() {
    const { classroomName, periods, deckName, deckPeriods, count, averageRating, cardsMissedMost } = this.state;
    const { classroomId } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.dashboard} destination='student pages' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{classroomName} - deck {deckName}</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={classroomId} periods={periods} />
          </div>

          <div className = 'active-view top-border'>
            <div id='student-stats-wrapper'>
              <div className = 'student-stats student-stats-individual navigation'>
                <h3 className = 'stat'>this deck has: {count} cards</h3>
                <h3 className = 'stat'>this deck supports periods: {deckPeriods.toString()}</h3>
                <h3 className = 'stat'>avg. card rating: {averageRating}</h3>
              </div>
            </div>

            <div>
              <div className = 'low-card'>
                <h2 className = 'low-card-header'>lowest rated cards</h2>
                {cardsMissedMost.length === 0
                  ? <p>You don&apos;t have any data yet! Try making a deck, and encourage your students to study.</p>
                  : cardsMissedMost.map((card) => {
                    return <LowRatedCard deckName={card.deckName} front={card.front} rating={card.rating} key={shortid.generate()} />;
                  })}
              </div>

              {/* HIGHEST RATED CARDS SECTION
              <div className = 'low-card'>
                <h2 className = 'low-card-header'>highest rated cards</h2>
                <div className = 'card-info inline-display'>
                  <h1 className = 'score'> 5.8 </h1>
                  <div className= 'nav'>
                    <h3 className = 'question'> Is the Calvin cycle for plants or animals? </h3>
                    <h4 className = 'deck-from'> in
                      <span className = 'italics'> Molecular Biology </span>
                    </h4>
                  </div>
                </div>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DeckTeacherView;

DeckTeacherView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      classroomId: PropTypes.string.isRequired,
      deckId: PropTypes.string.isRequired
    })
  })
};

LowRatedCard.propTypes = {
  deckName: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
};
