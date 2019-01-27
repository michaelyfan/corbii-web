import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import shortid from 'shortid';
import BackButton from '../reusables/BackButton';
import routes from '../../routes/routes';
import TeacherSidebar from './TeacherSidebar';
import { getClassroomInfo } from '../../utils/api.js';
import { getClassCardsMissedMost, getClassCardAverage, getClassStudents } from '../../utils/teacherapi.js';

function LowRatedCard(props) {
  const { rating, front, deckName } = props;

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
  )
}

function PeriodLink(props) {
  const { id, period } = props;
  return (
    <span>
      <Link to={`${routes.teacherViewClassroom}/${id}/${period}`}>
        <button className='dash-nav'>period {period}</button>
      </Link>
      <br />
    </span>
  )
}

PeriodLink.propTypes = {
  period: PropTypes.string.isRequired
}

class ClassroomTeacherView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: 'Loading...',
      periods: [],
      cardsMissedMost: [{
        deckName: 'deckName 1',
        front: 'sample 1',
        rating: '9'
      }, {
        deckName: 'deckName 2',
        front: 'sample 2',
        rating: '9'
      }],
      averageRatingPerCard: 0
    }
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    if (id == null) {
      this.props.history.push(routes.teacherDashboard);
    }

    Promise.all([
      getClassCardAverage(id),
      getClassroomInfo(id),
      // getClassCardsMissedMost(id),
      // getClassStudents(id)
    ]).then((result) => {
      const [ averageRating, classroomInfo ] = result;
      // cardId, deckId, classroomId, quality

      this.setState(() => ({
        name: classroomInfo.name,
        averageRatingPerCard: averageRating,
        periods: classroomInfo.periods
      }));
    });
  }

  render() {
    const { id } = this.props.match.params;
    const { name, periods, averageRatingPerCard, cardsMissedMost } = this.state;

    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacherDashboard} destination='dashboard' />
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
                  <h2 className = 'class-stats'> {averageRatingPerCard} </h2>
                </div>
              </div>
            </div>

            <div className = 'low-card'>
              <h2 className = 'low-card-header'>cards missed most</h2>
              {cardsMissedMost.length === 0
                ? <p>You don't have any data yet! Try making a deck, and encourage your students to study.</p>
                : cardsMissedMost.map((card) => {
                    return <LowRatedCard deckName={card.deckName} front={card.front} rating={card.rating} key={shortid.generate()} />
                  })}
              
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ClassroomTeacherView;