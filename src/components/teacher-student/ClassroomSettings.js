import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import routes from '../../routes/routes';
import BackButton from '../reusables/BackButton';
import { getStudentsFull, updateClassroom, deleteStudent, deletePeriod, deleteClassroom } from '../../utils/teacherapi';
import { getClassroomInfo } from '../../utils/api';

class ChangeNameForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nameInput: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    e.persist();

    this.setState(() => ({
      nameInput: e.target.value
    }));
  }

  handleSubmit(e) {
    e.preventDefault();
    const { nameInput } = this.state;
    const { classroomId, getClassInfo } = this.props;

    updateClassroom(classroomId, nameInput).then(() => {
      getClassInfo();
      this.setState(() => ({ nameInput: '' }));
    }).catch((err) => {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      console.error(err);
    });    
  }

  render() {
    const { nameInput } = this.state;
    return (
      <div>
        <h1>Change Classroom Name Form</h1>
        <form onSubmit={this.handleSubmit}>
          <input type='text' onChange={this.handleInputChange} value={nameInput} />
          <input type='submit' text='Submit New Name' />
        </form>
      </div>
    );
  }
}

class Period extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: ''
    };

    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete() {
    const { classroomId, period, getClassInfo } = this.props;

    // display a 'thanks-for-your-patience' type error message
    this.setState(() => ({
      message: 'Loading...\nThanks for your patience. Period deletions have a possibility of taking a while.'
    }), () => {
      deletePeriod(classroomId, period).then(() => {
        getClassInfo();
        this.setState(() => ({
          message: ''
        }));
      }).catch((err) => {
        this.setState(() => ({
          message: ''
        }));
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
        console.error(err);
      });
    });
  }

  render() {
    const { period } = this.props;
    const { message } = this.state;

    return (
      <div>
        <h1 style={{display: 'inline'}}>Period {period}</h1>
        <button onClick={this.handleDelete}>Delete period</button>
        <p>{message}</p>
      </div>
    );
  }
}

class PeriodList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newPeriodInput: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { newPeriodInput } = this.state;
    const { classroomId, getClassInfo } = this.props;

    updateClassroom(classroomId, null, [newPeriodInput]).then(() => {
      getClassInfo();
      this.setState(() => ({
        newPeriodInput: ''
      }));
    }).catch((err) => {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      console.error(err);
    });
  }

  handleInputChange(e) {
    e.persist();

    this.setState(() => ({
      newPeriodInput: e.target.value
    }));
  }

  render() {
    const { periods, classroomId, getClassInfo } = this.props;
    const { newPeriodInput } = this.state;

    return (
      <div>
        <h1>Period list</h1>
        <div>
          { periods.map((period) =>
            <Period key={period} period={period} classroomId={classroomId} getClassInfo={getClassInfo} />
          )}
        </div>
        <div>
          <h1>Add a period:</h1>
          <form onSubmit={this.handleSubmit}>
            <input type='text' value={newPeriodInput} onChange={this.handleInputChange} />
            <input type='submit' text='Submit' />
          </form>
        </div>
      </div>
    );
  }
}

class Student extends React.Component {
  constructor(props) {
    super(props);

    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete() {
    const { classroomId, student, getClassStudents } = this.props;
    const { id } = student;

    deleteStudent(classroomId, id).then(() => {
      getClassStudents();
    }).catch((err) => {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      console.error(err);
    });
  }

  render() {
    const { student } = this.props;
    return (
      <div>
        <div>
          <h3>{student.name}</h3>
          <p>Period {student.period}</p>
        </div>
        <div>
          <p>Kick out this student?</p>
          <button onClick={this.handleDelete}>Delete</button>
        </div>
      </div>
    );
  }
}

class StudentList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { students, getClassStudents, classroomId } = this.props;
    return (
      <div>
        <h1>Student List</h1>
        <div>
          { students.map((student) => 
            <Student key={shortid.generate()}
              student={student}
              getClassStudents={getClassStudents}
              classroomId={classroomId} />
          )}
        </div>
      </div>
    );
  }
}

class ClassroomSettings extends React.Component {

  constructor(props) {
    super(props);

    /**
     * Where state.periods has objects of structure:
     *   {
     *     name: 'String',
     *     id: 'String',
     *     period: 'String'
     *   }
     */
    this.state = {
      students: [],
      periods: [],
      name: 'Loading...',
      deleteLoading: false
    };

    this.getClassStudents = this.getClassStudents.bind(this);
    this.getClassInfo = this.getClassInfo.bind(this);
    this.handleDeleteClassroom = this.handleDeleteClassroom.bind(this);
  }

  componentDidMount() {
    this.getClassStudents();
    this.getClassInfo();
  }

  getClassStudents() {
    const { id } = this.props.match.params;
    getStudentsFull(id).then((result) => {
      const studentsState = [];
      result.forEach((student) => {
        studentsState.push({
          name: student.name,
          period: student.period,
          id: student.id
        });
      });
      // using non-functional setState because we want batching
      this.setState({
        students: studentsState
      });
    });
  }

  getClassInfo() {
    const { id } = this.props.match.params;
    getClassroomInfo(id).then((res) => {
      // using non-functional setState because we want batching
      this.setState({
        periods: res.periods,
        name: res.name
      });
    });
  }

  doDeleteClassroom() {
    const { id } = this.props.match.params;

    // display a 'thanks-for-your-patience' type error message
    this.setState(() => ({
      deleteLoading: true
    }), () => {
      deleteClassroom(id).then(() => {
        this.setState(() => ({
          deleteLoading: false
        }));
        this.props.history.push(routes.teacher.dashboard);
      }).catch((err) => {
        this.setState(() => ({
          deleteLoading: false
        }));
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
        console.error(err);
      });
    });
  }

  handleDeleteClassroom() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui'>
            <h1 className = 'delete-deck-confirm'>are you sure you want to delete this classroom?</h1>
            <h1 className = 'delete-deck-confirm' id = 'small-confirm'>this action cannot be undone, and can take a while.</h1>
            <div className = 'inline-display center-subtitle'>
              <button className = 'no-button'onClick={onClose}>no</button>
              <button className = 'yes-button' onClick={() => {
                this.doDeleteClassroom();
                onClose();
              }}>yes</button>
            </div>
          </div>
        );
      }
    });
  }

  render() {
    const { id } = this.props.match.params;
    const { name, periods, students, deleteLoading } = this.state;

    return (
      <div>
        {deleteLoading
          ? <div>
            <h1>Loading...</h1>
          </div>
          : <div>
            <BackButton redirectTo={routes.teacher.getViewClassroomRoute(id)} destination='classroom' />
            <h1>CLASSROOM SETTINGS PAGE for {name}</h1>
            <ChangeNameForm classroomId={id} getClassInfo={this.getClassInfo} />
            <PeriodList classroomId={id} periods={periods} getClassInfo={this.getClassInfo} />
            <StudentList classroomId={id} students={students} getClassStudents={this.getClassStudents} />
            <div>
              <button onClick={this.handleDeleteClassroom}>Delete this classroom</button>
            </div>
          </div>}
      </div>
    );
  }
}

ClassroomSettings.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
StudentList.propTypes = {
  students: PropTypes.array.isRequired,
  getClassStudents: PropTypes.func.isRequired,
  classroomId: PropTypes.string.isRequired
};
Student.propTypes = {
  student: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    period: PropTypes.string.isRequired
  }),
  classroomId: PropTypes.string.isRequired,
  getClassStudents: PropTypes.func.isRequired
};
PeriodList.propTypes = {
  periods: PropTypes.array.isRequired,
  classroomId: PropTypes.string.isRequired,
  getClassInfo: PropTypes.func.isRequired
};
Period.propTypes = {
  period: PropTypes.string.isRequired,
  classroomId: PropTypes.string.isRequired,
  getClassInfo: PropTypes.func.isRequired
};
ChangeNameForm.propTypes = {
  classroomId: PropTypes.string.isRequired,
  getClassInfo: PropTypes.func.isRequired
};

export default ClassroomSettings;