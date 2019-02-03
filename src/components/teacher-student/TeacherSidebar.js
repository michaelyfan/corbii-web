import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import PropTypes from 'prop-types';

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

PeriodLink.propTypes = {
  period: PropTypes.string.isRequired
};

export default function TeacherSideBar(props) {
  const { id, periods } = props;
  return (
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
      <Link to={routes.teacher.getViewDecksRoute(id)}>
        <button className = 'dash-nav'>view deck analytics</button>
      </Link>
      <br />
      {periods.map((period) => 
        <PeriodLink period={period} id={id} key={`${id}_${period}`} />
      )}
    </div>
  );
}