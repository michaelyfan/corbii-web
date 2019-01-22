import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';

export default function DeniedNoAuth(props) {
  return (
    <div className = 'no-access'>
      <h1 className = 'denied'>Sorry! You have to be signed in or have a teacher account to access certain pages.</h1>
      <Link to={routes.home}>
        <div className = 'center-button'>
          <button className = 'primary-button go-to-home'>go to home</button>
        </div>
      </Link>
    </div>
  )
} 