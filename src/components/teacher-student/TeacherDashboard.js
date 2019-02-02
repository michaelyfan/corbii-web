import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import { getClassrooms, createJoinCode, createClassroom } from '../../utils/teacherapi';
import { WithContext as ReactTags } from 'react-tag-input';

function Period(props) {
  const { classroomId, period } = props;
  return (
    <div>
      <p className = 'class-periods'>join code for period {period}:&nbsp; 
        <span className = 'period-emphasis'>{createJoinCode(classroomId, period)}</span>
      </p>
    </div>
  )
}

class ClassroomRow extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    const { id, periods, name } = this.props;
    return (
      <div>
        <Link to ={routes.teacher.getViewClassroomRoute(id)}>
          <h3 className = 'classroom-name'> {name} </h3>
        </Link>
        {periods.map((period) => {
          return <Period classroomId={id} period={period} key={period}  className = 'class-periods'/>
        })}

      </div>
    )
  }
}

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class CreateClassroomForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      tags: []
    }

    this.submitClassroom = this.submitClassroom.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePeriods = this.handleChangePeriods.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
  }

  handleDelete(i) {
    const { tags } = this.state;
    this.setState({
     tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleAddition(tag) {
      this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleChangeName(e) {
    e.persist();
    this.setState(() => ({
      name: e.target.value
    }))
  }

  handleChangePeriods(e) {
    e.persist();
    this.setState(() => ({
      periods: e.target.value
    }))
  }

  submitClassroom(e) {
    e.preventDefault();

    const { name, tags } = this.state;
    
    const periodsArr = tags.map((tag) => {
      return tag.text;
    })

    createClassroom(name, periodsArr).then(() => {
      this.props.doGetClassrooms();
    })

  }

  render() {
    const { name, periods, tags } = this.state;
    return (
      <form>
        <div className = 'center-button'>
          <input className = 'create-class' placeholder='classroom name' type='text' value={name} onChange={this.handleChangeName} />
        </div>
        <div className = 'center-button'>
          <ReactTags 
            tags = {tags}
            handleDelete={this.handleDelete}
            handleAddition={this.handleAddition}
            delimiters={delimiters}
            placeholder = 'add period (enter)'
            inline = {true}
            classNames={{
              tags: 'tagsClass',
              tagInputField: 'create-class',
              selected: 'selectedClass',
              tag: 'tagClass',
              remove: 'removeClass',
            }}

          />
        </div>
        <br />
        <div className = 'center-button'>
          <button className = 'primary-button' id = 'create-classroom' onClick={this.submitClassroom}>create classroom</button>
        </div>
      </form>
    )
  }
}

class TeacherDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      classrooms: [],
      students: [],
      dataContent: null
    }

    this.doGetClassrooms = this.doGetClassrooms.bind(this);
  }

  componentDidMount() {
    this.doGetClassrooms();
  }

  doGetClassrooms() {
    getClassrooms().then((result) => {
      let classrooms = [];
      result.forEach((classroom) => {
        classrooms.push(classroom);
      })
      this.setState(() => ({
        classrooms: classrooms
      }))
    })
  }

  render() {
    const { dataContent, classrooms, students } = this.state;

    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <h3 className = 'emphasized-words' id='dashboard-welcome'>Welcome to your classroom hub!</h3>
        </div>
        <h3 className = 'your-stuff center-button'>your classrooms</h3>
        <div className = 'blue-background'>
          <CreateClassroomForm doGetClassrooms={this.doGetClassrooms} />
          {classrooms.map((classroom) => {
            const { periods, name } = classroom.data();
            return <ClassroomRow name={name} periods={periods} id={classroom.id} key={classroom.id} />;
          })}
        </div>
      </div>
    )
  }
}

export default TeacherDashboard;