/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

/* Required modules */
import BackButton from '../reusables/BackButton';
import routes from '../../routes/routes';
import { Link } from 'react-router-dom';

function LowRatedCard(props) {
  const { deckName, front, rating } = props;
  return (
    <div className = 'card-info inline-display'>
      <h1 className = 'score'> {rating} </h1>
      <div className= 'nav'>
        <h3 className = 'question'> {front} </h3>
        <h4 className = 'deck-from'> in
          <span className = 'italics'> {deckName} </span>
        </h4>
      </div>
    </div>
  );
}

function PeriodLink(props) {
  const { id, period } = props;
  return (
    <span>
      <Link to={routes.teacher.getViewPeriodRoute(id, period)}>
        <button className='dash-nav'>period {period}</button>
      </Link>
      <br />
    </span>
  );
}

function CardGraph(props) {
  const { cards } = props;
  const qualityCounts = {};
  cards.forEach((card) => {
    // add to this card's quality count if quality exists
    if (qualityCounts[card.quality]) {
      qualityCounts[card.quality] += 1;
    } else {
      // create new quality count and add this card
      qualityCounts[card.quality] = 1;
    }
  });

  return (
    <p>{JSON.stringify(qualityCounts, null, 2)}</p>
  );
}

class StudentTeacherView extends React.Component {

  constructor(props) {
    super(props);
    /**
     * cardsMissedMost has the structure:
     * {
     *   deckName: '',
     *   front: '',
     *   rating: ''
     * }
     *
     * cards has the standard class data point structure.
     *
     *
     */
    this.state = {
      name: 'Loading...',
      period: '0',
      periods: [],
      numCardsStudied: 0,
      averageRating: 0,
      cards: [],
      cardsMissedMost: []
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  async getInfo() {
    const { id } = this.props.match.params;
    // check for null id
    if (id == null) {
      this.props.history.push(routes.teacher.dashboard);
    }

    try {
      // const [ numCardsStudied, cardsMissedMost, studentInfo, classroomInfo, averageRating, cards ] = await Promise.all([Insert methods here]);
      // TODO: fix above call
      // TODO: refactor stufffff
    } catch (e) {
      alert('Apologies -- there was an error!');
      console.error(e);
    }
  }

  render() {
    const { name, period, periods, numCardsStudied, averageRating, cards, cardsMissedMost } = this.state;
    const { id } = this.props.match.params;
    return (
      <div className = 'dashboard'>
        <div className = 'dashboard-header'>
          <BackButton redirectTo={routes.teacher.dashboard} destination='student pages' />
          <div className='flex-center student-header-individual'>
            <img className='student-pic-individual' src='/src/resources/genericprofile.jpg' />
            <div>
              <h1 className = 'emphasized-words emphasized-words-individual'>{name}</h1>
              <p className='period-subtitle'>Period {period}</p>
            </div>
          </div>
        </div>

        <div className = 'inline-display'>
          <div className = 'dashboard-menu' id = 'no-margin'>
            <div className ='navigation'>
              <Link to={{
                pathname: routes.teacher.create,
                state: {
                  isForClassroom: true,
                  classroomId: id
                }
              }}>
                <button className = 'dash-nav'>
                    create a new deck
                </button>
              </Link>
              <br />
              <Link to={routes.teacher.getViewStudentsRoute(id)}>
                <button className = 'dash-nav'>view student analytics</button>
              </Link>
              <br />
              <button className = 'dash-nav'>view deck analytics</button>
              <br />
              {periods.map((period) => 
                <PeriodLink period={period} id={id} key={shortid.generate()} />
              )}
            </div>
          </div>

          <div className = 'active-view top-border'>
            <div id='student-stats-wrapper'>
              <div className = 'student-stats student-stats-individual navigation'>
                <h3 className = 'stat'>cards studied: {numCardsStudied}</h3>
                <h3 className = 'stat'>avg. card rating: {averageRating}</h3>
              </div>
              <div>
                <h2>GRAPH GOES HERE</h2>
                <CardGraph cards={cards} />
                {/* CARD QUALITY GRAPH -- TODO: replace with React bargraph module */}
                {/* <img className='student-graph-individual' src='/src/resources/graph.jpg' /> */}
              </div>
            </div>

            <div>
              <div className = 'low-card'>
                <h2 className = 'low-card-header'>lowest rated cards</h2>
                {cardsMissedMost.length === 0
                  ? <p>You don&apos;t have any data yet! Try making a deck, and encourage your students to study.</p>
                  : cardsMissedMost.map((card) => {
                    return <LowRatedCard deckName={card.deckName} front={card.front} rating={card.rating} key={shortid.generate()} />;
                  })}
              </div>

              {/* HIGHEST RATED CARDS SECTION
              <div className = 'low-card'>
                <h2 className = 'low-card-header'>highest rated cards</h2>
                <div className = 'card-info inline-display'>
                  <h1 className = 'score'> 5.8 </h1>
                  <div className= 'nav'>
                    <h3 className = 'question'> Is the Calvin cycle for plants or animals? </h3>
                    <h4 className = 'deck-from'> in
                      <span className = 'italics'> Molecular Biology </span>
                    </h4>
                  </div>
                </div>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default StudentTeacherView;

StudentTeacherView.propTypes = {
  // TODO: fill out
};

CardGraph.propTypes = {
  cards: PropTypes.array.isRequired
};

PeriodLink.propTypes = {
  period: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};

LowRatedCard.propTypes = {
  deckName: PropTypes.string.isRequired,
  front: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
};