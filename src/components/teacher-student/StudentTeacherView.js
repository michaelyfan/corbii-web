/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';

/* Required modules */
import BackButton from '../reusables/BackButton';
import TeacherSidebar from './reusables/TeacherSidebar';
import LowRatedCards from './reusables/LowRatedCards';
import routes from '../../routes/routes';
import { getClassDataRaw, filterClassDataRaw, getConsistentLowCards, getStudentInfo,  getCardAverage, getCardTimeAverage, getStudentStudyRatio } from '../../utils/teacherapi.js';
import { getClassroomInfo, getCardsInfo, getDeckInfo, getProfilePic, getDecksInClassroom } from '../../utils/api.js';
import { getNow, getHoursBeforeNow, arraysAreSame } from '../../utils/tools';

class FilterTime extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startTime: '',
      endTime: ''
    };
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(e) {
    e.persist();
    this.setState(() => ({
      [e.target.name]: e.target.value
    }));
  }

  render() {
    const { changeTimeFilter } = this.props;
    const { startTime, endTime } = this.state;
    return (
      <div>
        <span>Filter time by:</span>
        <button onClick={() => {changeTimeFilter(null, null);}}>None</button>
        <button onClick={() => {changeTimeFilter(getHoursBeforeNow(24), getNow());}}>Last day</button>
        <button onClick={() => {changeTimeFilter(getHoursBeforeNow(24 * 7), getNow());}}>Last week</button>
        <button onClick={() => {changeTimeFilter(getHoursBeforeNow(24 * 7 * 30), getNow());}}>Last 30 days</button>
        <form onSubmit={(e) => {
          e.preventDefault();
          changeTimeFilter(startTime, endTime);
        }}>
          <p>Custom time range...</p>
          <input type='text' name='startTime' value={startTime} onChange={this.handleInput} />
          <input type='text' name='endTime' value={endTime} onChange={this.handleInput} />
          <input type='submit' value='submit' />
        </form>
      </div>
    );
  }
}

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
      // get missed cards' information (front, back, etc)
      const cardsInfo = await getCardsInfo(consistentLowCards);
      // get missed cards' decks' names
      const deckNameCalls = [];
      consistentLowCards.forEach((cardObj) => {
        deckNameCalls.push(getDeckInfo(cardObj.deckId));
      });
      const deckInfos = await Promise.all(deckNameCalls);

      // create consistentLowCards state object from consistentLowCards, using deckInfos for deck
      //    names and cardsInfo for card front
      let consistentLowCardsState = [];
      consistentLowCards.forEach((cardObj, i) => {
        consistentLowCardsState.push({
          deckName: deckInfos[i].name,
          front: cardsInfo[cardObj.cardId].front,
          rating: cardObj.quality
        });
      });

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
            <div>
              <h5>Filter:</h5>
              <button onClick={() => {this.setState(() => ({ deckFilter: undefined }));}}>None</button>
              {Object.entries(decks).map((pair) =>
                <button onClick={() => {this.setState(() => ({ deckFilter: pair[0] }));}} key={pair[0]}>{pair[1]}</button>
              )}
            </div>
            <FilterTime changeTimeFilter={this.changeTimeFilter} />
            <div id='student-stats-wrapper'>
              <div className = 'student-stats student-stats-individual navigation'>
                <h3 className = 'stat'>cards studied: {numCardsStudied}</h3>
                <h3 className = 'stat'>avg. card rating: {averageRating.toFixed(2)}</h3>
                <h3 className = 'stat'>avg. card time: {Math.trunc(averageTime)} seconds</h3>
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
FilterTime.propTypes = {
  changeTimeFilter: PropTypes.func.isRequired
};