import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import PropTypes from 'prop-types';

export default function BackButton(props) {
  const { redirectTo, destination } = props;
  return (
    <Link to={redirectTo}>
      <button className = 'back-to-deck'>back to {destination}</button>
    </Link>
  )
}

BackButton.propTypes = {
  redirectTo: PropTypes.string,
  destination: PropTypes.string
}

BackButton.defaultProps = {
  redirectTo: routes.dashboard.base,
  destination: 'dashboard'
}
