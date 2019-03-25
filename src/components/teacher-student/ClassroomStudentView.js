import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getClassroomForUser } from '../../utils/api';
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
      <div className = 'flex'>
        <button className = 'study-classroom-deck'>study {name}</button>
        <br/>
      </div>
    </Link>
  );
}

class ClassroomStudentView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      classroomId: '',
      classroomName: '',
      decks: [],
      teacherName: '',
      period: ''
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    
    getClassroomForUser(id).then((result) => {
      this.setState(() => ({
        classroomId: result.id,
        classroomName: result.name,
        teacherName: result.teacherId,
        decks: result.decks,
        period: result.period
      }));
    }).catch((err) => {
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      console.error(err);
    });
  }

  render() {
    const { classroomId, classroomName, decks, teacherName, period } = this.state;
    return (
      <div>
        <div className = 'dashboard-header'>
          <h1 className = 'classroom-title'>{classroomName}</h1>
          <p className = 'classroom-subtitle'>Teacher: {teacherName}</p>
          <p className = 'classroom-subtitle'>Period: {period}</p>
          <br/>
        </div>
        <div className = 'classroom-body'>
          <br/>
          <br/>
          {decks.map((deck) => <DeckRow name={deck.data().name} 
            classroomId={classroomId}
            period={period}
            id={deck.id} 
            key={deck.id} />
          )}
        </div>
      </div>
    );
  }
}

export default ClassroomStudentView;

ClassroomStudentView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  })
};

DeckRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  classroomId: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired
};