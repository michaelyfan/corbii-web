import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';
import PropTypes from 'prop-types';

function Footer(props) {
  const { signedIn, isTeacher } = props;
  return (
    <div className = 'footer'>
      <div><Link to={
        signedIn
          ? isTeacher
            ? routes.teacher.dashboard
            : routes.dashboard.base
          : routes.home.base
      } className = 'footer-link'>home</Link></div>
      <div><Link to={routes.faq.base} className = 'footer-link'> faq</Link></div>
      <div><Link to={routes.search.base} className = 'footer-link' id = 'footer-search'>search</Link></div>
      <div className = 'footer-social'>
        <a target = '_blank' rel="noopener noreferrer" href = 'https://www.instagram.com/corbiitech/'>
          <img src = '/src/resources/footer/ig.png' />
        </a>
      </div> 
      <div className = 'footer-social'>
        <a target = '_blank' rel="noopener noreferrer" href = 'https://www.facebook.com/corbiitech/'>
          <img src = '/src/resources/footer/fb.png' />
        </a>
      </div>
      <div className = 'footer-social'>
        <a target = '_blank' rel="noopener noreferrer" href = 'https://www.twitter.com/corbiitech/'>
          <img src = '/src/resources/footer/twitter.png' />
        </a>
      </div>
    </div>
  );
}

Footer.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  isTeacher: PropTypes.bool.isRequired
};

export default Footer;