import React from 'react';
import PropTypes from 'prop-types';
import routes from '../../routes/routes';
import BackButton from '../reusables/BackButton';
import {Link} from 'react-router-dom';

class PeriodTeacherView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  componentDidMount() {
    const { id, period } = this.props.match.params;
    if (id == null || period == null) {
      this.props.history.push(routes.teacherDashboard);
    }
  }

  render() {
    const { id, period } = this.props.match.params;    
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={`${routes.teacherViewClassroom}/${id}`} destination='classroom' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>classroom name - period {period}</h3>
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
            <div class= 'needs-border'>
              <h3 class = 'studied-header'> 
                <span class = 'percent-emph'>{}% </span>
                of your students are caught up on studying. 
              </h3>
              <div class = 'inline-display center-button'>
                <div class = 'classroom-basic'>
                  <h2 class = 'class-stat-title'> average rating per card </h2>
                  <h2 class = 'class-stats'> rating here </h2>
                </div>
              </div>
            </div>

            <div class = 'low-card'>
              <h2 class = 'low-card-header'>lowest rated cards</h2>
              <div class = 'card-info inline-display'>
                <h1 class = 'score'> # </h1>
                <div class= 'nav'>
                  <h3 class = 'question'> card front here </h3>
                  <h4 class = 'deck-from'> in
                    <span class = 'italics'> deck title here </span>
                  </h4>
                </div>
              </div>
            </div>

            <div class = 'low-card'>
              <h2 class = 'low-card-header'>highest rated cards</h2>
              <div class = 'card-info inline-display'>
                <h1 class = 'score'> # </h1>
                <div class= 'nav'>
                  <h3 class = 'question'> card front here </h3>
                  <h4 class = 'deck-from'> in
                    <span class = 'italics'> deck title here </span>
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