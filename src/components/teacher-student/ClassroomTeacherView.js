/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';

/* Required modules */
import BackButton from '../reusables/BackButton';
import FilterTime from '../reusables/FilterTime';
import routes from '../../routes/routes';
import TeacherSidebar from './reusables/TeacherSidebar';
import LowRatedCards from './reusables/LowRatedCards';
import { getClassroomInfo, getDeckInfo, getCardsInfo } from '../../utils/api';
import { getClassDataRaw, filterClassDataRaw, getCardsMissedMost, getCardAverage } from '../../utils/teacherapi';
import { arraysAreSame } from '../../utils/tools';

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
      periodFilter: undefined,
      timeFilter: null,
      name: 'Loading...',
      periods: [],
      cardsMissedMost: [],
      averageRatingPerCard: 0
    };

    // allData is a QuerySnapshot of Firestore classSpacedRepData datapoints
    // allCardsMissedMost is an array of card content information, containing:
    // {
    //   deckName,
    //   front,
    //   id,
    //   rating
    // }
    this.allData = null;
    this.allCardsMissedMost = null;

    // Method binding
    this.changeTimeFilter = this.changeTimeFilter.bind(this);
  }

  componentDidMount() {
    this.getDataAndInfo().then(() => {
      this.filterData();
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // check for period update
    if (this.state.periodFilter !== prevState.periodFilter) {
      this.filterData();
    }

    // check for time update
    if (!arraysAreSame(this.state.timeFilter, prevState.timeFilter)) {
      this.filterData();
    }
  }

  /*
   * Gets all of this classroom's data points and metaInfo (non-data related info such as
   *    name, number of content cards, etc)
   */
  async getDataAndInfo() {
    const { id } = this.props.match.params;

    try {
      // get classroom info first to allow error catch if classroom doesn't exist
      const [ classroomInfo ] = await Promise.all([
        getClassroomInfo(id),
      ]);

      const data = await getClassDataRaw(id, null, null, null);

      this.allData = data;
      this.setState(() => ({
        name: classroomInfo.name,
        periods: classroomInfo.periods,
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
   * Filters allData and sets data-related state based on filtered data.
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
        // get card content information (front, back, etc) for the missed cards
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
            rating: cardObj.averageQuality,
            id: cardObj.cardId
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
        averageRatingPerCard: averageRating,
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
            <TeacherSidebar id={id}/>
          </div>

          <div className = 'active-view'>
            <div className = 'add-padding'>
              <span className =  'filter-prompt'>show period:</span>
              <button className = 'view-filter-button' onClick={() => {this.setState(() => ({ periodFilter: undefined }));}}>all</button>
              {periods.map((period) => 
                <button className = 'view-filter-button' onClick={() => {this.setState(() => ({ periodFilter: period }));}} key={period}>period {period}</button>
              )}
            </div>
            <FilterTime handleTimes={this.changeTimeFilter} />

            <div className= 'needs-border'>
              <div className = 'inline-display center-button'>
                <div className = 'classroom-basic'>
                  <h2 className = 'class-stat-title'> average rating per card </h2>
                  <h2 className = 'class-stats'> {averageRatingPerCard.toFixed(2)} </h2>
                </div>
              </div>
            </div>

            <LowRatedCards cards={cardsMissedMost} />
            
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