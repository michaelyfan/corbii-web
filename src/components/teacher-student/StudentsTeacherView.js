/* Required dependencies. */
import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

/* Required modules. */
import routes from '../../routes/routes';
import { Link } from 'react-router-dom';
import BackButton from '../reusables/BackButton';
import TeacherSidebar from './TeacherSidebar';
import { getClassroomInfo } from '../../utils/api.js';
import { getClassStudents, getStudentsInfo } from '../../utils/teacherapi.js';

function StudentRow(props) {
  const { name, period, id } = props;
  return (
    <div className = 'block-display'>
      <div className = 'inline-display center-items'>
        <Link to={`${routes.teacherViewStudent}/${id}`} className = 'inline-display'>
          <div className = 'profile-display'>
            {/*
            <img className = 'profile-img' id = 'profile-thumbnail' src = '/src/resources/genericprofile.jpg' />
            */}
            <h4 className = 'student-name'>{name}</h4>
          </div>
          <div className = 'student-stats navigation'>
            <h3 className = 'stat'>period:  {period}</h3>
          </div>
        </Link>
      </div>
    </div>
  );
}

class StudentsTeacherView extends React.Component {

  constructor(props) {
    super(props);

    /*
     *  structure of students:
     *     {
     *       name: '',
     *       period: '',
     *       id: ''
     *     }    
     *
     */
    this.state = {
      students: [],
      name: 'Loading...',
      periods: []
    };
  }

  componentDidMount() {
    this.getStudents();
  }

  async getStudents() {
    try {
      const { id } = this.props.match.params;
      // get classrooms' students from api
      const [ students, classroomInfo ] = await Promise.all([
        getClassStudents(id),
        getClassroomInfo(id)
      ]);
      // construct student ID array for getStudentsInfo call
      const ids = students.map((student) => {
        return student.id;
      });
      const studentsInfo = await getStudentsInfo(ids);
      // construct students attribute of state
      const studentsState = students.map((student) => {
        return {
          name: studentsInfo[student.id].name,
          period: student.period,
          id: student.id
        };
      });
      this.setState(() => ({
        name: classroomInfo.name,
        periods: classroomInfo.periods,
        students: studentsState
      }));
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const { students, name, periods } = this.state;
    const { id } = this.props.match.params;

    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={`${routes.teacherViewClassroom}/${id}`} destination='classroom' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{name} - students</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={id} periods={periods} />
          </div>

          <div className = 'active-view top-border flex-display'>
            {students.map((student) =>
              <StudentRow name={student.name}
                period={student.period}
                id={student.id}
                key={shortid.generate()} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default StudentsTeacherView;

StudentsTeacherView.propTypes = {
  // TODO: fill out PropTypes
};

StudentRow.propTypes = {
  name: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};