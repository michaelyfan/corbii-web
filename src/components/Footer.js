import React from 'react';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
  render() {
    return (
      <div className = 'footer'>
        <table className = 'footer-table' align = 'center'>
          <tr>
            <th className = 'footer-link'><Link to='/dashboard'> my decks </Link></th>
            <th className = 'footer-link'><Link to='/FAQ'> faq </Link></th>
            <th className = 'footer-link' id = 'footer-search'><Link to='/search'> search </Link></th>
            <th className = 'footer-social'>
              <a href = 'https://www.instagram.com/corbiitech/'>
                <img src = '/src/resources/footer/ig.png' />
              </a>
            </th>
            <th className = 'footer-social'>
              <a href = 'https://www.facebook.com/corbiitech/'>
                <img src = '/src/resources/footer/fb.png' />
              </a>
            </th>
            <th className = 'footer-social'>
              <a href = 'https://www.twitter.com/corbiitech/'>
                <img src = '/src/resources/footer/twitter.png' />
              </a>
            </th>
          </tr>
        </table>
      </div>
    )
  }
}

export default Footer;