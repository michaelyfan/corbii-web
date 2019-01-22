# corbii-web
Corbii's web platform.


# TODOS
### Frontend
- use something better looking than standard HTML file input
- "If I press new card I think it should automatically select the text box so I can start typing" - Hank Hellstrom
- make profile settings option stick to bottom of side bar
- stuff is off-centered when you're viewing a deck or conceptlist that isn't yours
 - additionally, the "|" character remains when you're viewing a deck or a conceptlist that isn't yours
- make footer stick to bottom of site
- fix search ui (is it working??)
- Homepage.js shouldn't be accessible or should be changed when logged in
- ConceptList.js should use the autoresize text input
- center StudyConcept.js box, no matter what the arrows are

### Backend
- implement new override algorithm
- it is impossible for a quality of 0 to be added to class data points, and it is impossible for a quality less than 2 to be acted on by the algorithm for non-class cases. Verify that this is intentional. The former case may make class data for the teacher misleading.
- compress profile pictures that come in.
- cache data where possible and most efficient instead of retrieving every time
- add robots file to disallow web scrapers (or something?)
- show intervals next to card studying options
- automatically updating isDue field in Firestore (somehow...) instead of updating on retrieval
- implement structure necessary for a study history
- should I deploy as a Node app and use a server, or deploy as a static app and use Cloud Functions?

### Fullstack
- bug: can't call setState on unmounted component when finished studying a deck (incident: happened studying a class deck). Happens sometimes.
  "in CardWrapper (created by StudyDeck)"
- bug: being able to access the view deck page as a student when clicking deck title while studying a deck. brings you to sketchy place
- add PropTypes for all components in StudyDeck
- add filter by period to Teacher classroom view. Investigate the one that you already.
- error handling D:
- refactor StudyDeck.js
- teacher features.
 - implement actual data pulling
 - add checks for inputs
 - implement study timecount in seconds
- back to the correct location when reaching a deck (either from search or from dashboard)
- maintain array of inputs for conceptlist studying instead of one constant input
- before deployment:
  - clean up dependencies
  - lint everything
  - follow this: https://github.com/rotati/wiki/wiki/Deployment-and-QA-Workflow
- get the actual user/pass input fields working for login. 
- case 14: a login session exists. It is a teacher. The page starts on the Dashboard. 
- case 16: a teacher navigates to the Dashboard, or any other non-teacher page.
- handle different time zones
- use a webpack solution better than copy-webpack-plugin
- enforce timestamp ordering for cards
  - use server time
- implement pictures into the decks
- owen and hank bug testing notes