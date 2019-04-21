/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';

/* Required modules */
import BackButton from '../reusables/BackButton';
import FilterTime from '../reusables/FilterTime';
import TeacherSidebar from './reusables/TeacherSidebar';
import LowRatedCards from './reusables/LowRatedCards';
import routes from '../../routes/routes';
import { getClassDataRaw, filterClassDataRaw, getCardsMissedMost, getCardAverage } from '../../utils/teacherapi.js';
import { getClassroomInfo, getCardsInfo, getDeckInfo } from '../../utils/api.js';
import { arraysAreSame } from '../../utils/tools';

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
      periodFilter: undefined,
      timeFilter: null,
      classroomName: 'Loading...',
      periods: [],
      deckName: 'Loading...',
      deckPeriods: [],
      count: 0,
      averageRating: 0,
      cardsMissedMost: []
    };

    this.allData = null;
    this.allCardsMissedMost = null;
    this.changeTimeFilter = this.changeTimeFilter.bind(this);
  }

  componentDidMount() {
    this.getDataAndInfo().then(() => {
      this.filterData();
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.periodFilter !== prevState.periodFilter) {
      this.filterData();
    }

    // check for time update
    if (!arraysAreSame(this.state.timeFilter, prevState.timeFilter)) {
      this.filterData();
    }
  }

  /*
   * Gets all of this deck's data points and this deck's metaInfo (non-data  related info such as
   *    classroomName, number of content cards, etc)
   */
  async getDataAndInfo() {
    const { classroomId, deckId } = this.props.match.params;

    try {
      // get classroom and deck info first to allow error catch if either don't exist
      const [ classroomInfo, deckInfo ] = await Promise.all([
        getClassroomInfo(classroomId),
        getDeckInfo(deckId)
      ]);

      const data = await getClassDataRaw(classroomId, null, deckId, null);

      this.allData = data;
      this.setState(() => ({
        classroomName: classroomInfo.name,
        periods: classroomInfo.periods,
        deckName: deckInfo.name,
        deckPeriods: Object.keys(deckInfo.periods),
        count: deckInfo.count,
      }), () => {
        return Promise.resolve();
      });
    } catch (e) {
      alert(`Apologies -- there was an error:\n${e}\nTry renavigating to this page instead of using direct links.`);
      console.error(e);
      return Promise.reject(e);
    }
  }

  /*
   * Filters allData state attribute and sets data-related state based on filtered data.
   */
  async filterData() {
    const { periodFilter, timeFilter } = this.state;
    const { allData } = this;

    // filter allData based on state filter
    const filteredData = filterClassDataRaw({ period: periodFilter, times: timeFilter }, allData);

    try {
      const [ cardsMissedMost, averageRating ] = await Promise.all([
        getCardsMissedMost(null, filteredData),
        getCardAverage(null, filteredData)
      ]);

      let cardsMissedMostState;
      if (!this.allCardsMissedMost) {
        // get card content information (front, back) for the missed cards
        const cardsInfo = await getCardsInfo(cardsMissedMost);

        // get missed cards' decks' names
        // first determine which decks to get (to avoid getting duplicates)
        const deckIds = new Set();
        cardsMissedMost.forEach((cardObj) => {
          deckIds.add(cardObj.deckId);
        });
        // then get the names of the decks
        const deckNameCalls = [];
        deckIds.forEach((deckId) => {
          deckNameCalls.push(getDeckInfo(deckId));
        });
        const decksInfo = await Promise.all(deckNameCalls);

        // create cardsMissedMost state object from cardsMissedMost, using decksInfo for deck
        //    names and cardsInfo for card front
        cardsMissedMostState = [];
        cardsMissedMost.forEach((cardObj) => {
          let matchingDeck = decksInfo.find(deck => deck.id === cardObj.deckId);
          // if we didn't find a deck for this card, this is an error and warn
          if (!matchingDeck) {
            console.warn(`no deck found for card ${cardObj.cardId}`);
            return;
          }
          let deckName = matchingDeck.name;
          cardsMissedMostState.push({
            deckName,
            front: cardsInfo[cardObj.cardId].front,
            id: cardObj.cardId,
            rating: cardObj.averageQuality
          });
        });

        // save this cardsMissedMost state object for future filterings
        this.allCardsMissedMost = cardsMissedMostState;
      } else {
        // retrieve existing card content info and filter with respect to cards in cardsMissedMost
        cardsMissedMostState = [];
        cardsMissedMost.forEach((cardObj) => {
          const existingCardEntry = this.allCardsMissedMost.find((existing) => {
            return existing.id === cardObj.cardId;
          });
          if (existingCardEntry == null) {
            console.warn(`no existing card found for card with id ${cardObj.cardId}`);
            return;
          }
          cardsMissedMostState.push({
            deckName: existingCardEntry.deckName,
            front: existingCardEntry.front,
            id: cardObj.cardId,
            rating: cardObj.averageQuality
          });
        });
      }

      this.setState(() => ({
        averageRating: averageRating,
        cardsMissedMost: cardsMissedMostState,
      }));
    } catch (e) {
      alert(`Apologies -- there was an error:\n${e}\nTry renavigating to this page instead of using direct links.`);
      console.error(e);
    }
  }

  changeTimeFilter(startTimestamp, endTimestamp) {
    this.setState(() => {
      if (startTimestamp == null || endTimestamp == null) {
        return {
          timeFilter: null
        };
      } else {
        return {
          timeFilter: [startTimestamp, endTimestamp]
        };
      }
    });
  }

  render() {
    const { classroomName, periods, deckName, deckPeriods, count, averageRating, cardsMissedMost } = this.state;
    const { classroomId } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.getViewClassroomRoute(classroomId)} destination='classroom' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{classroomName} - deck {deckName}</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={classroomId} />
          </div>

          <div className = 'active-view top-border'>
            <div className = 'flex'>
              <p className = 'filter-prompt'>filter:</p>
              <button className = 'view-filter-button small-height' onClick={() => {this.setState(() => ({ periodFilter: undefined }));}}>none</button>
              {periods.map((period) => 
                <button className = 'view-filter-button small-height' onClick={() => {this.setState(() => ({ periodFilter: period }));}} key={period}>{period}</button>
              )}
            </div>
            <FilterTime handleTimes={this.changeTimeFilter} />
            <div id='student-stats-wrapper'>
              <div className = 'student-stats student-stats-individual navigation'>
                <h3 className = 'stat'>this deck has: {count} cards</h3>
                <h3 className = 'stat'>this deck supports periods: {deckPeriods.toString()}</h3>
                <h3 className = 'stat'>avg. card rating: {averageRating}</h3>
                <br/>
              </div>
            </div>

            <div>
              <LowRatedCards cards={cardsMissedMost} />

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