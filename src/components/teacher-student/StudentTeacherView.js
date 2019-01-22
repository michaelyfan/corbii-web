import React from 'react';
import PropTypes from 'prop-types';
import BackButton from '../reusables/BackButton';
import routes from '../../routes/routes';
import { Link } from 'react-router-dom';


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

class StudentTeacherView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      students: [{
        name: 'testStudent2'
        }],
      name: 'subject name here',
      periods: ['1', '6', '7']
    }
  }

  render() {
    const { students, name, periods } = this.state;
    const { id } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacherDashboard} destination='student pages' />
          <div className='flex-center student-header-individual'>
            <img className='student-pic-individual' src='/src/resources/genericprofile.jpg' />
            <div>
              <h1 className = 'emphasized-words emphasized-words-individual'>Owen Schupp</h1>
              <p className='period-subtitle'>Period 4</p>
            </div>
          </div>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <div className ='navigation'>
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
              <button className = 'dash-nav'>view deck analytics</button>
              <br />
              {periods.map((period) => 
                <PeriodLink period={period} id={id} key={id} />
              )}
            </div>
          </div>

          <div className = 'active-view top-border'>
            <div id='student-stats-wrapper'>
              <div className = 'student-stats student-stats-individual navigation'>
                <h3 className = 'stat'>cards studied: 109</h3>
                <h3 className = 'stat'>avg. study session: 42 mins</h3>
                <h3 className = 'stat'>avg. card rating: 3.3</h3>
              </div>
              <div>
                <img className='student-graph-individual' src='/src/resources/graph.jpg' /> 
              </div>
            </div>
            <div>
              <div className = 'low-card'>
                <h2 className = 'low-card-header'>lowest rated cards</h2>
                <div className = 'card-info inline-display'>
                  <h1 className = 'score'> 1.1 </h1>
                  <div className= 'nav'>
                    <h3 className = 'question'> What are the components of ATP? </h3>
                    <h4 className = 'deck-from'> in
                      <span className = 'italics'> Molecular Biology </span>
                    </h4>
                  </div>

                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

StudentTeacherView.propTypes = {
  
}

export default StudentTeacherView;