import React from 'react';

export default function FAQ() {
  return (
    <div className='faq'>
      <h2 className = 'faq-question'>What is Corbii?</h2>
      <h5 className = 'faq-answer'>
        Corbii is a study application that uses spaced repetition to schedule flashcards for you. Spaced repetition is a research-backed technique to make your learning more effective and efficient.
      </h5>
      <h2 className = 'faq-question'>Does Corbii support keyboard shortcuts?</h2>
      <h5 className = 'faq-answer'>Yes! While studying, you can use the spacebar to flip flashcards to reveal the research-back
      of  the card you are studying. When Corbii asks for your comfort level, you can use the number keys (1-6) to select your
      rating.</h5>
      <h2 className='faq-question'>How did Corbii start?</h2>
      <h5 className='faq-answer'>Corbii was originally a startup founded in early 2018 by Owen Schupp, Michael Fan, Sarah Weyand, Hank Hellstrom,
      and Pratik Nallamotu as part of Georgia Tech's startup incubator, Startup Launch. Life eventually took the founders to other endeavors, but
      the website will remain up for anyone who wants a smarter way to learn.<br />Our old social media links:
        <br />
        <a className='faq-pic-link' target='_blank' rel="noopener noreferrer" href='https://www.facebook.com/corbiitech/'>
          Facebook
        </a>
        <br />
        <a className='faq-pic-link' target='_blank' rel="noopener noreferrer" href='https://www.instagram.com/corbiitech/'>
          Instagram
        </a>
        <br />
        <a className='faq-pic-link' target='_blank' rel="noopener noreferrer" href='https://www.twitter.com/corbiitech/'>
          Twitter
        </a>
      </h5>
    </div>
  );
}