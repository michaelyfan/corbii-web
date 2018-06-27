import React from 'react';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
  render() {
    return (
      <div className = 'footer'>
        <div><Link to='/dashboard' className = 'footer-link'>my decks </Link></div>
        <div><Link to='/FAQ' className = 'footer-link'> faq </Link></div>
        <div><Link to='/search' className = 'footer-link' id = 'footer-search'> search </Link></div>
        <div className = 'footer-social'>
          <a href = 'https://www.instagram.com/corbiitech/'>
            <img src = '/src/resources/footer/ig.png' />
          </a>
        </div> 
        <div className = 'footer-social'>
          <a href = 'https://www.facebook.com/corbiitech/'>
            <img src = '/src/resources/footer/fb.png' />
          </a>
        </div>
        <div className = 'footer-social'>
          <a href = 'https://www.twitter.com/corbiitech/'>
            <img src = '/src/resources/footer/twitter.png' />
          </a>
        </div>
      </div>
    )
  }
}

export default Footer;