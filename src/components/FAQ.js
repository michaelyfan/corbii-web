import React from 'react';

export default function FAQ() {
  return (
    <div className='faq'>
      <h2 className = 'faq-question'>What is Corbii?</h2>
      <h5 className = 'faq-answer'>
        Corbii is a learning webapp that uses research-backed techniques to make your learning more effective and more efficient.
      </h5>
      <h2 className = 'faq-question'>How did Corbii begin?</h2>
      <h5 className = 'faq-answer'>Corbii was founded in early 2018 by Owen Schupp, Michael Fan, Sarah Weyand, Hank Hellstrom, and Pratik Nallamotu
      as a part of Georgia Tech&apos;s 2018 Create-X startup launch. Corbii&apos;s prototype was deployed in July 2018 and
      has plans to be launched as an Alpha version in August 2018.</h5>
      <h2 className = 'faq-question'>What does Corbii offer to students?</h2>
      <h5 className = 'faq-answer'> With Corbii, users can create their own flashcard decks and concept lists to study any content they want to learn.
      What&apos;s more, they can search and access decks and lists created by all other users on the site. Studying is easy. Students can
      study their flashcards using our scientific spaced repetition algorithm that takes all the guesswork out of knowing when and how long
      to study. Students can also join classrooms created by their teachers to access study material, teacher-created flashcards, and view
      relevent decks created by fellow students.</h5>
      <h2 className = 'faq-question'>What does Corbii offer to teachers?</h2>
      <h5 className = 'faq-answer'>Corbii offers unparalled tools for teachers to learn about their students&apos; needs and memory retention. With Corbii&apos;s classroom tool,
      teachers can create a space for student learning and collaboration, and share study tools and key concepts with their students. When students
      use these tools to study, detailed data and metrics about their accuracy and commonly missed concepts and flashcards are recorded and made accessible
      to teachers, so they can know what concepts students understand and which to review.</h5>
      <h2 className = 'faq-question'>Does Corbii support keyboard shortcuts?</h2>
      <h5 className = 'faq-answer'>Yes! While studying, you can use the spacebar to flip flashcards to reaveal the research-back
      of  the card you are studying. When Corbii asks for your comfort level, you can use the number keys (1-6) to select your
      rating.</h5>
    </div>
  );
}