import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';

class Footer extends React.Component {
  render() {
    return (
      <div className = 'footer'>
        <div><Link to={routes.dashboardRoute} className = 'footer-link'>my decks </Link></div>
        <div><Link to={routes.faqRoute} className = 'footer-link'> faq </Link></div>
        <div><Link to={routes.searchRoute} className = 'footer-link' id = 'footer-search'> search </Link></div>
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