import React from 'react';
import { Link } from 'react-router-dom';

export default function DeniedNoAuth(props) {
  return (
    <div>
      <h1>Sorry! You have to be signed in to access certain pages.</h1>
      <Link to='/'>
        <button>Go to home</button>
      </Link>
    </div>
  )
} 