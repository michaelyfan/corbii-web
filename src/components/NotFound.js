import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';

function NotFound(props) {
  return (
    <div className='page-404'>
      <h1>You've discovered a 404 page</h1>
      <div>
        <img src='/src/resources/404.jpg' />
      </div>
      <Link to={routes.homeRoute}><button>Return home</button></Link>
    </div>
  )
}

export default NotFound;