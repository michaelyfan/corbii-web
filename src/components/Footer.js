import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';
import PropTypes from 'prop-types';

// image assets
import igImage from '../resources/footer/ig.png';
import fbImage from '../resources/footer/fb.png';
import twitterImage from '../resources/footer/twitter.png';

function Footer(props) {
  const { signedIn } = props;
  return (
    <div className = 'footer'>
      <div><Link to={
        signedIn
          ? routes.dashboard.base
          : routes.home.base
      } className = 'footer-link'>home</Link></div>
      <div><Link to={routes.faq.base} className = 'footer-link'> faq</Link></div>
      <div><Link to={routes.search.base} className = 'footer-link' id = 'footer-search'>search</Link></div>
      <div className = 'footer-social'>
        <a target = '_blank' rel="noopener noreferrer" href = 'https://www.instagram.com/corbiitech/'>
          <img src = {igImage} />
        </a>
      </div> 
      <div className = 'footer-social'>
        <a target = '_blank' rel="noopener noreferrer" href = 'https://www.facebook.com/corbiitech/'>
          <img src = {fbImage} />
        </a>
      </div>
      <div className = 'footer-social'>
        <a target = '_blank' rel="noopener noreferrer" href = 'https://www.twitter.com/corbiitech/'>
          <img src = {twitterImage} />
        </a>
      </div>
    </div>
  );
}

Footer.propTypes = {
  signedIn: PropTypes.bool.isRequired,
};

export default Footer;