import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';
import PropTypes from 'prop-types';

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
    </div>
  );
}

Footer.propTypes = {
  signedIn: PropTypes.bool.isRequired,
};

export default Footer;