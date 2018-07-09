import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';

function NotFound(props) {
  return (
    <div className='no-access' id ='error-page'>
      <div className = 'error'>
        <img className = 'uhoh' src='/src/resources/404.jpg' />
        <h1 className = 'denied' id = 'whoops'>uh oh! looks like this page doesn't exist.</h1>
      </div>
      <Link to={routes.homeRoute}>
        <div className = 'center-button'>
          <button className = 'primary-button'>
            return home
          </button>
        </div>
      </Link>
    </div>
  )
}

export default NotFound;