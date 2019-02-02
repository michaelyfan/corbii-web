import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';

export default function BackToDashboardButton(props) {
  return (
    <Link to={routes.dashboard.base}>
      <button className = 'back-to-deck'>back to dashboard</button>
    </Link>
  )
}
