import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getClassroomForUser, getClassroomCurrentUser } from '../../utils/api';
import routes from '../../routes/routes';

function DeckRow(props) {
  const { name, id, classroomId, period } = props;

  return (
    <Link to={{
      pathname: routes.classroomStudy.getRoute(id),
      state: { 
        fromClassroom: true,
        period: period,
        classroomId: classroomId
      }
    }}>
      <button>Study {name} (id: {id})</button>
    </Link>
  );
}

DeckRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  classroomId: PropTypes.string.isRequired
};

class ClassroomStudentView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      classroomId: '',
      decks: [],
      teacherName: '',
      period: ''
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    
    // put check here to determine class presence
    Promise.all([
      getClassroomForUser(id),
      getClassroomCurrentUser(id)
    ]).then((result) => {
      const [ classroom, classroomUser ] = result;
      this.setState(() => ({
        classroomId: classroom.id,
        teacherName: `ID ${classroom.data.teacherId}`,
        decks: classroom.decks,
        period: classroomUser.data().period
      }))

    }).catch((err) => {
      console.error(err);
    })
  }

  render() {
    const { classroomId, decks, teacherName, period } = this.state;
    return (
      <div>
        <h1>Viewing classroom</h1>
        <p>Teacher: {teacherName}</p>
        <p>Period: {period}</p>
        <p>Id: {classroomId} </p>
        <div>
          {decks.map((deck) => {
            return <DeckRow name={deck.data().name} 
                      classroomId={classroomId}
                      period={period}
                      id={deck.id} 
                      key={deck.id} />
          })}
        </div>
      </div>
    )
  }
}

export default ClassroomStudentView;