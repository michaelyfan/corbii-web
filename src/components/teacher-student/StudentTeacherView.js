/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

/* Required modules */
import BackButton from '../reusables/BackButton';
import TeacherSidebar from './TeacherSidebar';
import routes from '../../routes/routes';
import { getClassDataRaw, filterClassDataRaw, getConsistentLowCards, getStudentInfo,  getCardAverage, getCardTimeAverage, getClassData, getStudentStudyRatio } from '../../utils/teacherapi.js';
import { getClassroomInfo, getCardsInfo, getDeckInfo, getProfilePic, getDecksInClassroom } from '../../utils/api.js';

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
     */
    this.state = {
      allData: null,
      name: 'Loading...',
      period: '0',
      periods: [],
      photoUrl: '',
      numCardsStudied: 0,
      averageRating: 0,
      averageTime: 0,
      consistentLowCards: [],
      datapoints: [],
      deckFilter: undefined,
      decks: {}
    };
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
  }

  async getDataAndInfo() {
    const { classroomId, userId } = this.props.match.params;
    try {
      const [ data, studentInfo, classroomInfo, photoUrl ] = await Promise.all([
        getClassDataRaw(classroomId, null, null, userId),
        getStudentInfo(classroomId, userId),
        getClassroomInfo(classroomId),
        getProfilePic(userId)
      ]);

      const { name, period } = studentInfo;
      const [ studyRatio, deckDocs ] = await Promise.all([
        getStudentStudyRatio(classroomId, userId, period),
        getDecksInClassroom(classroomId, period)
      ]);

      let deckObj = {};
      // transform deckDocs into decks state attribute
      deckDocs.forEach((snap) => {
        deckObj[snap.id] = snap.data().name;
      });

      this.setState(() => ({
        allData: data,
        name: name,
        period: period,
        periods: classroomInfo.periods,
        numCardsStudied: studyRatio[0],
        photoUrl: photoUrl,
        decks: deckObj
      }), () => {
        return Promise.resolve();
      });
    } catch (e) {
      alert('Apologies -- there was an error!');
      console.error(e);
    }
  }

  async filterData() {
    const { allData, deckFilter } = this.state;
    // filter allData based on state filter
    const filteredData = filterClassDataRaw({ deckId: deckFilter }, allData);

    try {
      const [ consistentLowCards, averageRating, averageTime ] = await Promise.all([
        getConsistentLowCards(null, filteredData),
        getCardAverage(null, filteredData),
        getCardTimeAverage(null, filteredData)
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
        datapoints: datapts
      }));

    } catch (e) {
      alert('Apologies -- there was an error!');
      console.error(e);
    }
  }

  // async getInfo() {
  //   const { classroomId, userId } = this.props.match.params;

  //   try {
  //     const data = await getClassDataRaw(classroomId, null, null, userId);
  //     const [ consistentLowCards, studentInfo, classroomInfo, averageRating,
  //       averageTime, photoUrl ] = await Promise.all([
  //       getConsistentLowCards(null, data),
  //       getStudentInfo(classroomId, userId),
  //       getClassroomInfo(classroomId),
  //       getCardAverage(null, data),
  //       getCardTimeAverage(null, data),
  //       getProfilePic(userId)
  //     ]);
  //     const { name, period } = studentInfo;
  //     const [ studyRatio, cardsInfo ] = await Promise.all([
  //       getStudentStudyRatio(classroomId, userId, period),
  //       getCardsInfo(consistentLowCards)
  //     ]);
      
  //     // get missed cards' decks' names
  //     const deckNameCalls = [];
  //     consistentLowCards.forEach((cardObj) => {
  //       deckNameCalls.push(getDeckInfo(cardObj.deckId));
  //     });
  //     const deckInfos = await Promise.all(deckNameCalls);

  //     // create consistentLowCards state object from consistentLowCards, using deckInfos for deck
  //     //    names and cardsInfo for card front
  //     let consistentLowCardsState = [];
  //     consistentLowCards.forEach((cardObj, i) => {
  //       consistentLowCardsState.push({
  //         deckName: deckInfos[i].name,
  //         front: cardsInfo[cardObj.cardId].front,
  //         rating: cardObj.quality
  //       });
  //     });

  //     // transform data
  //     const datapts = [];
  //     data.forEach((datapt) => {
  //       const thisData = datapt.data();
  //       thisData.id = datapt.id;
  //       datapts.push(thisData);
  //     });

  //     this.setState(() => ({
  //       name: name,
  //       period: period,
  //       periods: classroomInfo.periods,
  //       numCardsStudied: studyRatio[0],
  //       averageRating: averageRating,
  //       averageTime: averageTime,
  //       consistentLowCards: consistentLowCardsState,
  //       datapoints: datapts,
  //       photoUrl: photoUrl
  //     }));
  //   } catch (e) {
  //     alert('Apologies -- there was an error!');
  //     console.error(e);
  //   }
  // }

  render() {
    const { name, period, periods, numCardsStudied, averageRating, averageTime, datapoints, consistentLowCards, photoUrl, decks } = this.state;
    const { classroomId } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.dashboard} destination='student pages' />
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
            <TeacherSidebar id={classroomId} periods={periods} />
          </div>

          <div className = 'active-view top-border'>
            <div>
              <h5>Filter:</h5>
              <button onClick={() => {this.setState(() => ({ deckFilter: undefined }));}}>None</button>
              {Object.entries(decks).map((pair) =>
                <button onClick={() => {this.setState(() => ({ deckFilter: pair[0] }));}} key={pair[0]}>{pair[1]}</button>
              )}
            </div>
            <div id='student-stats-wrapper'>
              <div className = 'student-stats student-stats-individual navigation'>
                <h3 className = 'stat'>cards studied: {numCardsStudied}</h3>
                <h3 className = 'stat'>avg. card rating: {averageRating.toFixed(2)}</h3>
                <h3 className = 'stat'>avg. card time: {Math.trunc(averageTime)} seconds</h3>
              </div>
              <div>
                <h2>GRAPH GOES HERE</h2>
                <CardGraph cards={datapoints} />
                {/* CARD QUALITY GRAPH -- TODO: replace with React bargraph module */}
                {/* <img className='student-graph-individual' src='/src/resources/graph.jpg' /> */}
              </div>
            </div>

            <div>
              <div className = 'low-card'>
                <h2 className = 'low-card-header'>lowest rated cards</h2>
                {consistentLowCards.length === 0
                  ? <p>You don&apos;t have any data yet! Try making a deck, and encourage your students to study.</p>
                  : consistentLowCards.map((card) => {
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

LowRatedCard.propTypes = {
  deckName: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
};
