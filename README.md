# corbii-web
A study app that schedules your flashcards for you. Schedules are determined with scientifically-backed spaced repetition algorithms, making studying more effective and efficient.

https://corbii-web.web.app/

## Development 

1. Clone this repo
1. Install dependencies (`npm i`)
1. Start the webpack development server with `npm run dev`
1. Code away      

The webpack development server comes with hot reloading.

## Deploying to Firebase

1. Ensure you are on master
1. Build the app with `npm run build` or `npm run build-windows`
1. Deploy your desired Firebase changes
   * `firebase deploy` defaults to everything, including hosting
   * can also use `firebase deploy --only [firebase-service-name-here]` ex. `firebase deploy --only firestore`
   * refer to the [Firebase CLI](https://firebase.google.com/docs/cli/) docs for more info
