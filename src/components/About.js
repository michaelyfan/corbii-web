import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className='about'>
      <p>
        Corbii is a learning webapp that uses research-backed techniques to make your learning more effective and more efficient.
      </p>
      <div>
        <Link to='/'>
          Get started
        </Link>
      </div>
    </div>
  )
}