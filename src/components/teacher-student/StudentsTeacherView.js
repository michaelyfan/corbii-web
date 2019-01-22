import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import routes from '../../routes/routes';
import { Link } from 'react-router-dom';
import BackButton from '../reusables/BackButton';
import TeacherSidebar from './TeacherSidebar';

function StudentRow(props) {
  const { name, cardsStudied, averageCardRating, id } = props;
  return (
    <div className = 'block-display'>
      <div className = 'inline-display center-items'>
        <Link to={`${routes.teacherViewStudent}/${id}`} className = 'inline-display'>
          <div className = 'profile-display'>
            <img className = 'profile-img' id = 'profile-thumbnail' src = '/src/resources/genericprofile.jpg' />
            <h4 className = 'student-name'>{name}</h4>
          </div>
          <div className = 'student-stats navigation'>
            <h3 className = 'stat'>cards studied: {cardsStudied}</h3>
            <h3 className = 'stat'>avg. card rating: {averageCardRating}</h3>
          </div>
        </Link>
      </div>
    </div>

  )
}

class StudentsTeacherView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      students: [],
      name: 'Loading...',
      periods: []
    }
  }

  componentDidMount() {
    // someMethod().then((result) => {
    //   const { students, name, periods } = result;
    //   this.setState(() => ({
    //     students: students,
    //     name: name,
    //     periods: periods
    //   }))
    // }).catch((err) => {
    //   console.error(err);
    // })
  }

  render() {
    const { students, name, periods } = this.state;
    const { id } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacherDashboard} destination='classroom' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{name} - students</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={id} periods={periods} />
          </div>

          <div className = 'active-view top-border flex-display'>
            {students.map((student) =>
              <StudentRow name={student.name} 
                cardsStudied={student.cardsStudied} 
                averageCardRating={student.averageCardRating}
                key={shortid.generate()} />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default StudentsTeacherView;