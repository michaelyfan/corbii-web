/* Required dependencies. */
import React from 'react';
import PropTypes from 'prop-types';

/* Required modules. */
import routes from '../../routes/routes';
import { Link } from 'react-router-dom';
import BackButton from '../reusables/BackButton';
import TeacherSidebar from './reusables/TeacherSidebar';
import { getDecksInClassroom, getClassroomInfo  } from '../../utils/api.js';

function DeckRow(props) {
  const { name, count, periods, deckId, classroomId } = props;
  return (
    <div>
      <Link to={routes.teacher.getViewDeckRoute(classroomId, deckId)}>
        <div style={{margin: '10px'}}>
          <p>name: {name}</p>
          <p>count: {count}</p>
          <p>periods: {periods.toString()}</p>
        </div>
      </Link>
      <Link to={{
        pathname: routes.teacher.getViewDeckEditRoute(classroomId, deckId),
        state: {
          isForClassroom: true,
          classroomId
        }
      }}>
        <button>Edit this deck</button>
      </Link>
    </div>
  );
}

class DecksTeacherView extends React.Component {

  constructor(props) {
    super(props);

    /* 
     * decks has attributes 'name', 'id' of type string, 'periods' of type array of number, 'count'
     *    of type number
     */
    this.state = {
      decks: [],
      name: 'Loading...',
      periods: []
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  async getInfo() {
    try {
      const { id } = this.props.match.params;
      // get classroom info first to allow error catch if this classroom doesn't exist
      const classroomInfo = await getClassroomInfo(id);

      // get classrooms' decks and info
      const decks = await getDecksInClassroom(id, null, true);
      
      // construct decks attribute of state
      const decksState = [];
      decks.forEach((deck) => {
        decksState.push({
          name: deck.data().name,
          count: deck.data().count,
          periods: Object.keys(deck.data().periods),
          id: deck.id
        });
      });

      this.setState(() => ({
        name: classroomInfo.name,
        periods: classroomInfo.periods,
        decks: decksState
      }));
    } catch (e) {
      alert(`Apologies -- there was an error:\n${e}\nTry renavigating to this page instead of using direct links.`);
      console.error(e);
    }
  }

  render() {
    const { decks, name } = this.state;
    const { id } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.getViewClassroomRoute(id)} destination='classroom' />
          <h3 className = 'emphasized-words' id='teacher-welcome'>{name} - decks</h3>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <TeacherSidebar id={id} />
          </div>

          <div className = 'active-view top-border flex-display'>
            {decks.map((deck) => <DeckRow name={deck.name}
              count={deck.count}
              periods={deck.periods}
              deckId={deck.id}
              classroomId={id}
              key={deck.id} /> )}
          </div>
        </div>
      </div>
    );
  }
}

export default DecksTeacherView;

DecksTeacherView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  })
};

DeckRow.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  periods: PropTypes.array.isRequired,
  deckId: PropTypes.string.isRequired,
  classroomId: PropTypes.string.isRequired
};