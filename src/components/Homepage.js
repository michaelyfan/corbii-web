import React from 'react';
import { Link } from 'react-router-dom';

class Homepage extends React.Component {
  render() {
    return (
      <div>
        <h1>Welcome to Corbii.</h1>


        <div className='homepage-buttons'>
          <Link to='/signin'><button>I am a student</button></Link><br />
          <button onClick={() => {alert('Teacher functionality coming soon!')}}>I am a teacher</button>
        </div>
        
        <h3>Insert marketing text here. Talk about lots of things.</h3>
      </div>
    );
  }
}

export default Homepage;