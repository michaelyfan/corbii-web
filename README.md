# corbii-web
Corbii's web platform.

Check the Zenhub board for TODOs.

## Deployment Specifications and Instructions

During development, this app uses `concurrently` to run a webpack development server (port 8080) with hot reloading for react, and an express server (port 3000) with our api calls. `fetch` calls made on the client are proxied to the express server (this is specified in webpack settings). The dev environment can be started with `npm run dev`.

For production, the app's `master` branch can be pushed to the Heroku remote repo with `git push heroku master`. Heroku is configured to run the `prod` script, specified in `package.json`, which will start the Express server. Then, Heroku will run the `heroku-postbuild` script, which will install all needed dependencies and build the React app into a `dist` directory, which the Express server is configured to statically serve. At this point, all should be good.

Before pushing to Heroku, you can test the production process by mimicking it on your machine. From the root directory:

```
node src/server/server.js

npm i // if you haven't already

npm run build // or npm run windows-build depending on your OS
```

Then navigate to localhost:3000.

## Production Specifications

The `master` branch of `corbii-web` is the **production branch**. Do not push anything to master that is not ready for production; always use feature branches.

The `corbii-web` Firebase project is used for the `master` branch, while any development branch uses `corbii-web-dev` Firebase project. The Firebase CLI allows for the `corbii-web` repo to freely switch between both Firebase projects, a feature known as 'aliases'. 

## HIGH-LEVEL COMPONENT RETRIEVAL RECORDS

### ClassroomList:
getCurrentUserProfileInfo() -- user document in user collection

### ClassroomStudentView
getClassroomForUser() -- classroom user doc, classroom doc, decks col (with period query)

### ClassroomTeacherView
getClassDataRaw() -- data col (with queries)
getCardAverage() -- retrieves nothing, uses getClassData() result
getCardsMissedMost() -- retrieves nothing, uses getClassData() result
getClassroomInfo() -- classroom doc
getCardsInfo(getCardsMissedMost result) -- multiple card docs
Promise.all of multiple getDeckInfo(getCardsMissedMost result) -- multiple deck docs

### PeriodTeacherView
same as ClassroomTeacherView but with Period queries

### DecksTeacherView
getDecksInClassroom() -- decks col (with period query)
getClassroomInfo() -- classroom doc

### DeckTeacherView
getClassDataRaw() -- data col (with queries)
getCardsMissedMost() -- retrieves nothing, uses getClassData() result
getCardAverage() -- retrieves nothing, uses getClassData() result
getDeckInfo() -- deck doc
getClassroomInfo() -- classroom doc
getCardsInfo(getCardsMissedMost result) -- multiple card docs
Promise.all of multiple getDeckInfo(getCardsMissedMost result) -- multiple deck docs

### StudentsTeacherView
getStudents() -- class user col (with period query)
getClassroomInfo() -- classroom doc
getStudentsInfo(getStudents result) --  multiple user ('users' collection) docs

### StudentTeacherView
getClassDataRaw() -- data col 
getConsistentLowCards() -- retrieves nothing, uses getClassData() result
getCardAverage() -- retrieves nothing, uses getClassData() result
getCardTimeAverage() -- retrieves nothing, uses getClassData() result
getStudentStudyRatio(getStudentInfo result) -- decks col (with same queries) AND data col
getStudentInfo -- profile doc AND class user doc
  break this down into getClassroomUser (from api) and getUserProfileInfo(from api)
getClassroomInfo() -- classroom doc
getProfilePic() -- Storage call
getCardsInfo(getConsistentLowCards result) -- multiple card docs
Promise.all of multiple getDeckInfo(getConsistentLowCards result) -- multiple deck docs