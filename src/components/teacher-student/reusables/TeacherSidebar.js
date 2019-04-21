import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../../routes/routes';
import PropTypes from 'prop-types';

export default function TeacherSideBar(props) {
  const { id } = props;
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
      <Link to={routes.teacher.getViewStudentsRoute(id)}>
        <button className = 'dash-nav'>view student analytics</button>
      </Link>
      <Link to={routes.teacher.getViewDecksRoute(id)}>
        <button className = 'dash-nav'>view deck analytics</button>
      </Link>
      <Link to={routes.teacher.getClassSettingsRoute(id)}>
        <button className = 'dash-nav'>classroom settings</button>
      </Link>
    </div>
  );
}

TeacherSideBar.propTypes = {
  id: PropTypes.string.isRequired
};