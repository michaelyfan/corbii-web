import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';

export default function DeniedNoAuth() {
  return (
    <div className = 'no-access'>
      <h1 className = 'denied'>Sorry! You have to be signed in or have a specific account type to access certain pages.</h1>
      <Link to={routes.home.base}>
        <div className = 'center-button'>
          <button className = 'primary-button go-to-home'>go to home</button>
        </div>
      </Link>
    </div>
  );
} 