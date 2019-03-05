import React from 'react';
import PropTypes from 'prop-types';
import { getCurrentUserProfileInfo, createClassroomUser } from '../../utils/api';
import routes from '../../routes/routes';
import shortid from 'shortid';
import { Link } from 'react-router-dom';

class JoinClassroomForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      code: ''
    };

    this.handleChangeCode = this.handleChangeCode.bind(this);
    this.handleSubmitCode = this.handleSubmitCode.bind(this);
  }

  handleChangeCode(e) {
    e.persist();

    this.setState(() => ({
      code: e.target.value
    }));
  }

  handleSubmitCode(e) {
    e.preventDefault();

    createClassroomUser(this.state.code).then(() => {
      this.props.getClassrooms();
      this.setState(() => ({
        code: ''
      }));
    }).catch((err) => {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }

  render() {
    return (
      <div>
        <p className = 'classroom-headers'>Join Classroom</p>
        <form onSubmit={this.handleSubmitCode}>
          <div className = 'inline-display'>
            <div className = 'center-items'>
            <input type='text' placeholder='enter join code' id = 'classroom-add'
            value={this.state.code} onChange={this.handleChangeCode} />
            <input type='submit' text='join classroom' className = 'submit-button'/>
            </div>
          </div>
        </form>
        <br />
        <br/>
      </div>
    );
  }
}

function ClassroomRow(props) {
  const { classroomId } = props;
  return (
    <div>
      <Link to={routes.classroom.getRoute(classroomId)}>
      <div className = 'inline-display'>
        <button className='student-classroom-button'> classroom with id: {classroomId} </button>
      </div>
      </Link>
    </div>
  );
}

class ClassroomList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      classrooms: []
    };

    this.getClassrooms = this.getClassrooms.bind(this);
  }

  componentDidMount() {
    this.getClassrooms();
  }

  getClassrooms() {
    getCurrentUserProfileInfo().then((user) => {
      const classrooms = user.data().classrooms;
      if (classrooms) {
        this.setState(() => ({
          classrooms: classrooms
        }));
      }
    }).catch((err) => {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      console.error(err);
    });
  }

  render() {
    const { classrooms } = this.state;
    const isEmpty = classrooms.length <= 0;

    return (
      <div>
        {
          isEmpty
            ? <p className = 'classroom-headers'>You are not in any classrooms</p> 
            : classrooms.map((classroomId) => {
              return <div>
                <p className = 'classroom-headers'> Your Classrooms </p>
                <ClassroomRow key={shortid.generate()} classroomId={classroomId} />
              </div>;
            })
        }
        <JoinClassroomForm getClassrooms={this.getClassrooms} />
      </div>
    );
  }
}
ClassroomRow.propTypes = { classroomId: PropTypes.string.isRequired };
JoinClassroomForm.propTypes = { getClassrooms: PropTypes.func.isRequired };

export default ClassroomList;