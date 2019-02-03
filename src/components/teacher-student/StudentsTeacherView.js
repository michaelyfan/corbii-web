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
import { getStudents, getStudentsInfo } from '../../utils/teacherapi.js';

function StudentRow(props) {
  const { name, period, classroomId, studentId } = props;
  return (
    <div className = 'block-display'>
      <div className = 'inline-display center-items'>
        <Link to={routes.teacher.getViewStudentRoute(classroomId, studentId)} className = 'inline-display'>
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
     *  structure of object in students:
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
      periods: [],
      periodFilter: null
    };
    this.filterPeriod = this.filterPeriod.bind(this);
  }

  componentDidMount() {
    this.getStudents();
  }

  /**
   * Sets the periodFilter state, which controls student list period filtering.
   *
   * @param period - The period to filter list of students by. To remove filter, pass in null
   */
  filterPeriod(period) { this.setState(() => ({ periodFilter: period })); }

  async getStudents() {
    try {
      const { id } = this.props.match.params;
      // get classrooms' students from api
      const [ students, classroomInfo ] = await Promise.all([
        getStudents(id),
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
    const { students, name, periods, periodFilter } = this.state;
    const { id } = this.props.match.params;

    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.getViewClassroomRoute(id)} destination='classroom' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{name} - students</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={id} periods={periods} />
          </div>

          <div className = 'active-view top-border flex-display'>
            <div>
              <p>Filter by period:</p>
              <button onClick={() => { this.filterPeriod(null); }}>None</button>
              {periods.map((period) => 
                <button onClick={() => { this.filterPeriod(period); }} key={period}>{period}</button>
              )}
            </div>
            {students.map((student) =>{
              // only render this student if period to filter by is null, or if student period
              //    matches period to filter by
              if (periodFilter == null || periodFilter === student.period) {
                return <StudentRow name={student.name}
                  period={student.period}
                  studentId={student.id}
                  classroomId={id}
                  key={shortid.generate()} />;
              }
            })}
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
  studentId: PropTypes.string.isRequired,
  classroomId: PropTypes.string.isRequired
};