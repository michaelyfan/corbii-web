import React from 'react';
import PropTypes from 'prop-types';
import routes from '../../routes/routes';
import BackButton from '../reusables/BackButton';
import {Link} from 'react-router-dom';
import { getClassroomInfo } from '../../utils/api.js';
import { getPeriodCardsMissedMost, getPeriodCardAverage, getPeriodStudents } from '../../utils/teacherapi.js';

class PeriodTeacherView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      classroomName: 0,
      averageRatingPerCard: 0
    }
  }

  componentDidMount() {
    const { id, period } = this.props.match.params;
    if (id == null || period == null) {
      console.error('Null params found despite being at period teacher view route.');
      alert('Our apologies -- there was an error!');
      this.props.history.push(routes.teacherDashboard);
    }

    Promise.all([
      getPeriodCardAverage(id, period),
      getClassroomInfo(id),
      // getClassCardsMissedMost(id),
      // getClassStudents(id)
    ]).then((result) => {
      const [ averageRating, classroomInfo ] = result;
      // cardId, deckId, classroomId, quality

      this.setState(() => ({
        classroomName: classroomInfo.name,
        averageRatingPerCard: averageRating,
      }));
    });
  }

  render() {
    const { id, period } = this.props.match.params;
    const { classroomName, averageRatingPerCard } = this.state;


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
              <h3 className = 'studied-header'> 
                <span className = 'percent-emph'>{}% </span>
                of your students are caught up on studying. 
              </h3>
              <div className = 'inline-display center-button'>
                <div className = 'classroom-basic'>
                  <h2 className = 'class-stat-title'> average rating per card </h2>
                  <h2 className = 'class-stats'> {averageRatingPerCard} </h2>
                </div>
              </div>
            </div>

            <div className = 'low-card'>
              <h2 className = 'low-card-header'>lowest rated cards</h2>
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
          </div>
        </div>
      </div>
    )
  }
}


export default PeriodTeacherView;