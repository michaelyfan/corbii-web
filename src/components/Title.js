import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function Title(props) {
  const { text, titleLink, subtitle } = props;

  return (
    <div>
      <div className = 'center-button smaller-title'>
        {titleLink
          ? <Link to={titleLink} className='deck-title-view'>
              {text}
            </Link>
          : <p className = 'deck-title-view'>{text}</p>
        }
      </div>
      {subtitle && <p className = 'small-caption'>{subtitle}</p> }
    </div>
  )
}

Title.propTypes ={
  titleLink: PropTypes.string,
  text: PropTypes.string.isRequired,
  subtitle: PropTypes.string
}