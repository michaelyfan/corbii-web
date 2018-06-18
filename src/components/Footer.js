import React from 'react';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
  render() {
    return (
      <div className='footer'>
        <hr />
        <p>I am a footer. I will look better in the future.</p>
        <ul className='footer-ul'>
          <li>
            <Link to='/dashboard'>
              My Decks
            </Link>
          </li>
          <li>
            <Link to='/FAQ'>
              FAQ
            </Link>
          </li>
          <li>
            <Link to='/search'>
              Search
            </Link>
          </li>
          <li>
            <div>
              Social Media Icons Here
            </div>
          </li>
        </ul>
      </div>
    )
  }
}

export default Footer;