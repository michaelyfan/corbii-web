import React from 'react';
import PropTypes from 'prop-types';
import BackButton from '../reusables/BackButton';
import routes from '../../routes/routes';
import TeacherSidebar from './reusables/TeacherSidebar';
import LowRatedCards from './reusables/LowRatedCards';
import { getClassroomInfo, getDeckInfo, getCardsInfo } from '../../utils/api';
import { getClassDataRaw, filterClassDataRaw, getCardsMissedMost, getCardAverage } from '../../utils/teacherapi';
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
      allData: null,
      periodFilter: undefined,
      timeFilter: null,
      name: 'Loading...',
      periods: [],
      cardsMissedMost: [],
      averageRatingPerCard: 0
    };

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

      this.setState(() => ({
        allData: data,
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
   * Filters allData state attribute and sets data-related state based on filtered data.
   */
  async filterData() {
    const { allData, periodFilter, timeFilter } = this.state;

    // filter allData based on state filter
    const filteredData = filterClassDataRaw({ period: periodFilter, times: timeFilter }, allData);

    try {
      const [ cardsMissedMost, averageRating ] = await Promise.all([
        getCardsMissedMost(null, filteredData),
        getCardAverage(null, filteredData)
      ]);

      // get card content information (front, back) for the missed cards
      const cardsInfo = await getCardsInfo(cardsMissedMost);
      // get missed cards' decks' names
      const deckNameCalls = [];
      cardsMissedMost.forEach((cardObj) => {
        deckNameCalls.push(getDeckInfo(cardObj.deckId));
      });
      const decksInfo = await Promise.all(deckNameCalls);
      // create cardsMissedMost state object from cardsMissedMost, using decksInfo for deck
      //    names and cardsInfo for card front
      let cardsMissedMostState = [];
      cardsMissedMost.forEach((cardObj, i) => {
        cardsMissedMostState.push({
          deckName: decksInfo[i].name,
          front: cardsInfo[cardObj.cardId].front,
          rating: cardObj.averageQuality
        });
      });

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
            <div>
              <span>Period filter:</span>
              <button onClick={() => {this.setState(() => ({ periodFilter: undefined }));}}>None</button>
              {periods.map((period) => 
                <button onClick={() => {this.setState(() => ({ periodFilter: period }));}} key={period}>{period}</button>
              )}
            </div>
            <FilterTime changeTimeFilter={this.changeTimeFilter} />

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
FilterTime.propTypes = {
  changeTimeFilter: PropTypes.func.isRequired
};