import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import PropTypes from 'prop-types';

function PeriodLink(props) {
  const { id, period } = props;
  return (
    <span>
      <Link to={`${routes.teacherViewClassroom}/${id}/${period}`}>
        <button className='dash-nav'>period {period}</button>
      </Link>
      <br />
    </span>
  )
}

PeriodLink.propTypes = {
  period: PropTypes.string.isRequired
}

export default function TeacherSideBar(props) {
  const { id, periods } = props;
  return (
    <div className ='navigation'>
      <Link to={{
        pathname: routes.teacherCreate,
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
      <Link to={`${routes.teacherViewStudents}/${id}`}>
        <button className = 'dash-nav'>view student analytics</button>
      </Link>
      <br />
      <button className = 'dash-nav'>view deck analytics</button>
      <br />
      {periods.map((period) => 
        <PeriodLink period={period} id={id} key={`${id}_${period}`} />
      )}
    </div>
  )
}