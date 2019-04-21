/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';

/* Required modules */
import BackButton from '../reusables/BackButton';
import FilterTime from '../reusables/FilterTime';
import TeacherSidebar from './reusables/TeacherSidebar';
import LowRatedCards from './reusables/LowRatedCards';
import routes from '../../routes/routes';
import { getClassDataRaw, filterClassDataRaw, getConsistentLowCards, getStudentInfo,  getCardAverage, getCardTimeAverage, getStudentStudyRatio } from '../../utils/teacherapi.js';
import { getClassroomInfo, getCardsInfo, getDeckInfo, getProfilePic, getDecksInClassroom } from '../../utils/api.js';
import { arraysAreSame } from '../../utils/tools';

function CardGraph(props) {
  const { cards } = props;
  const qualityCounts = {};
  cards.forEach((card) => {
    // add to this card's quality count if quality exists
    if (qualityCounts[card.quality]) {
      qualityCounts[card.quality] += 1;
    } else {
      // create new quality count and add this card
      qualityCounts[card.quality] = 1;
    }
  });

  return (
    <p>{JSON.stringify(qualityCounts, null, 2)}</p>
  );
}

class StudentTeacherView extends React.Component {

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
     * datapoints has the standard class data point .data() structure.
     *
     * decks is an object containing decks where student has data:
     {
      'deckIdHere': deckName
     }
     *
     * data is an array of datapoint objects
     */
    this.state = {
      name: 'Loading...',
      period: '0',
      photoUrl: '',
      numCardsStudied: 0,
      averageRating: 0,
      averageTime: 0,
      consistentLowCards: [],
      datapoints: [],
      deckFilter: undefined,
      timeFilter: null,
      decks: {}
    };
    this.periods = [];
    this.studentDecks = [];
    this.allData = null;
    this.allConsistentLowCards = null;

    this.changeTimeFilter = this.changeTimeFilter.bind(this);
  }

  componentDidMount() {
    this.getDataAndInfo().then(() => {
      this.filterData();
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.deckFilter !== prevState.deckFilter) {
      this.filterData();
    }

    // check for time update
    if (!arraysAreSame(this.state.timeFilter, prevState.timeFilter)) {
      this.filterData();
    }
  }

  async getDataAndInfo() {
    const { classroomId, userId } = this.props.match.params;
    try {
      // get student info and classroom info first to allow error to catch if neither exist
      const [ studentInfo, classroomInfo ] = await Promise.all([
        getStudentInfo(classroomId, userId),
        getClassroomInfo(classroomId),
      ]);

      const [ data, photoUrl ] = await Promise.all([
        getClassDataRaw(classroomId, null, null, userId),
        getProfilePic(userId)
      ]);

      const { name, period } = studentInfo;
      const deckDocs = await getDecksInClassroom(classroomId, period, true);
      const studyRatio = await getStudentStudyRatio({classroomId, userId, period}, null, deckDocs);

      let deckObj = {};
      // transform deckDocs into decks state attribute
      deckDocs.forEach((snap) => {
        deckObj[snap.id] = snap.data().name;
      });

      // set state and instance variables
      this.allData = data;
      this.periods = classroomInfo.periods;
      this.studentDecks = deckDocs;
      this.setState(() => ({
        name: name,
        period: period,
        numCardsStudied: studyRatio[0],
        photoUrl: photoUrl,
        decks: deckObj
      }), () => {
        return Promise.resolve();
      });
    } catch (e) {
      alert(`Apologies -- there was an error:\n${e}\nTry renavigating to this page instead of using direct links.`);
      console.error(e);
      return Promise.reject(e);
    }
  }

  async filterData() {
    const { deckFilter, timeFilter } = this.state;
    const { allData, studentDecks } = this;

    // filter allData based on state filter
    const filteredData = filterClassDataRaw({ deckId: deckFilter, times: timeFilter }, allData);

    try {
      const [ consistentLowCards, averageRating, averageTime, studyRatio ] = await Promise.all([
        getConsistentLowCards(null, filteredData),
        getCardAverage(null, filteredData),
        getCardTimeAverage(null, filteredData),
        getStudentStudyRatio(null, filteredData, studentDecks)
      ]);

      let consistentLowCardsState;
      if (!this.allConsistentLowCards) {
        // get missed cards' information (front, back, etc)
        const cardsInfo = await getCardsInfo(consistentLowCards);

        // get missed cards' decks' names
        // first determine which decks to get (to avoid getting duplicates)
        const deckIds = new Set();        
        consistentLowCards.forEach((cardObj) => {
          deckIds.add(cardObj.deckId);
        });
        // then get the names of the decks
        const deckNameCalls = [];
        deckIds.forEach((deckId) => {
          deckNameCalls.push(getDeckInfo(deckId));
        });
        const decksInfo = await Promise.all(deckNameCalls);

        // create consistentLowCards state object from consistentLowCards, using decksInfo for deck
        //    names and cardsInfo for card front
        consistentLowCardsState = [];
        consistentLowCards.forEach((cardObj) => {
          let matchingDeck = decksInfo.find(deck => deck.id === cardObj.deckId);
          // if we didn't find a deck for this card, this is an error and warn
          if (!matchingDeck) {
            console.warn(`no deck found for card ${cardObj.cardId}`);
            return;
          }
          let deckName = matchingDeck.name;
          consistentLowCardsState.push({
            deckName,
            front: cardsInfo[cardObj.cardId].front,
            id: cardObj.cardId,
            rating: cardObj.quality
          });
        });

        // save this consistentLowCards state object for future filterings
        this.allConsistentLowCards = consistentLowCardsState;
      } else {
        // retrieve existing card content info and filter with respect to cards in consistentLowCards
        consistentLowCardsState = [];
        consistentLowCards.forEach((cardObj) => {
          const existingCardEntry = this.allConsistentLowCards.find((existing) => {
            return existing.id === cardObj.cardId;
          });
          if (existingCardEntry == null) {
            console.warn(`no existing card found for card with id ${cardObj.cardId}`);
            return;
          }
          consistentLowCardsState.push({
            deckName: existingCardEntry.deckName,
            front: existingCardEntry.front,
            id: cardObj.cardId,
            rating: cardObj.averageQuality
          });
        });
      }

      // transform data
      const datapts = [];
      filteredData.forEach((datapt) => {
        const thisData = datapt.data();
        thisData.id = datapt.id;
        datapts.push(thisData);
      });

      this.setState(() => ({
        averageRating: averageRating,
        averageTime: averageTime,
        consistentLowCards: consistentLowCardsState,
        numCardsStudied: studyRatio[0],
        datapoints: datapts
      }));
    } catch (e) {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${e}`);
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
    const { name, period, numCardsStudied, averageRating, averageTime, datapoints, consistentLowCards, photoUrl, decks } = this.state;
    const { classroomId } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.getViewClassroomRoute(classroomId)} destination='classroom' />
          <div className='flex-center student-header-individual'>
            <img className='student-pic-individual' src={photoUrl} />
            <div>
              <h1 className = 'emphasized-words emphasized-words-individual'>{name}</h1>
              <p className='period-subtitle'>Period {period}</p>
            </div>
          </div>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={classroomId} />
          </div>

          <div className = 'active-view top-border'>
            <div className = 'flex'>
              <p className = 'filter-prompt'>filter:</p>
              <button className = 'view-filter-button small-height' onClick={() => {this.setState(() => ({ deckFilter: undefined }));}}>none</button>
              {Object.entries(decks).map((pair) =>
                <button className = 'view-filter-button small-height' onClick={() => {this.setState(() => ({ deckFilter: pair[0] }));}} key={pair[0]}>{pair[1]}</button>
              )}
            </div>
            <FilterTime handleTimes={this.changeTimeFilter} />
            <div id='student-stats-wrapper'>
              <div className = 'student-stats student-stats-individual navigation'>
                <h3 className = 'stat'>cards studied: {numCardsStudied}</h3>
                <h3 className = 'stat'>avg. card rating: {averageRating.toFixed(2)}</h3>
                <h3 className = 'stat'>avg. card time: {Math.trunc(averageTime)} seconds</h3>
                <br/>
              </div>
              <div>
                <h2>GRAPH GOES HERE</h2>
                <CardGraph cards={datapoints} />
                {/* CARD QUALITY GRAPH -- TODO: replace with something like a React bargraph module, or something else */}
                {/* The below placeholder image is what used to be here */}
                {/* <img className='student-graph-individual' src='/src/resources/graph.jpg' /> */}
              </div>
            </div>

            <div>
              <LowRatedCards cards={consistentLowCards} description='consistently low cards' />

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

export default StudentTeacherView;

StudentTeacherView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      classroomId: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired
    })
  })
};
CardGraph.propTypes = {
  cards: PropTypes.array.isRequired
};