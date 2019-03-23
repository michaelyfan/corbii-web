import React from 'react';
import PropTypes from 'prop-types';
import { getCurrentUserProfileInfo, getClassroomInfo, createClassroomUser } from '../../utils/api';
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
              <input type='text' placeholder='enter join code' id = 'classroom-add' value={this.state.code} onChange={this.handleChangeCode} />
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
  const { name, id } = props.classroom;
  return (
    <div>
      <Link to={routes.classroom.getRoute(id)}>
        <div className = 'inline-display'>
          <button className='student-classroom-button'> {name} </button>
        </div>
      </Link>
    </div>
  );
}

class ClassroomList extends React.Component {

  constructor(props) {
    super(props);

    /**
     * Where classrooms contains objects of structure:
     * {
     *   id,
     *   name,
     *   periods: [],
     *   teacherId
     * }
     */
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
      return user.data().classrooms;
    }).then((classroomIds) => {
      const calls = [];
      if (classroomIds) {
        classroomIds.forEach((cid) => {
          calls.push(getClassroomInfo(cid));
        });
        return Promise.all(calls);
      }
    }).then((classroomInfos) => {
      this.setState(() => ({
        classrooms: classroomInfos || []
      }));
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
            : classrooms.map((classroom) => {
              return <div key={shortid.generate()}>
                <p className = 'classroom-headers'> Your Classrooms </p>
                <ClassroomRow key={shortid.generate()} classroom={classroom} />
              </div>;
            })
        }
        <JoinClassroomForm getClassrooms={this.getClassrooms} />
      </div>
    );
  }
}
ClassroomRow.propTypes = {
  classroom: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    periods: PropTypes.array.isRequired,
    teacherId: PropTypes.string.isRequired
  })
};
JoinClassroomForm.propTypes = { getClassrooms: PropTypes.func.isRequired };

export default ClassroomList;