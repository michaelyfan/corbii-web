# corbii-web
Corbii's web platform.

Check the Zenhub board for TODOs.

## Deployment Specifications and Instructions

During development, this app runs a webpack development server (port 8080) with hot reloading for react. The dev environment can be started with `npm run dev`.

For production, the app is built with `npm run build` and then hosted on Firebase Hosting with `firebase deploy` or `firebase deploy --only hosting`. Firebase statically serves the built files.

This app used to use Heroku, but that's behind us now.


## Production Specifications

The `master` branch of `corbii-web` is the **production branch**. Do not push anything to master that is not ready for production; always use feature branches.

The `corbii-web` Firebase project is used for the `master` branch, while any development branch uses `corbii-web-dev` Firebase project. The Firebase CLI allows for the `corbii-web` repo to freely switch between both Firebase projects, a feature known as 'aliases'. 

## Development Instructions

* Clone this repo
* run `npm install`
* acquire .env file from a head developer
* run `npm run dev`
* code away

These instructions will eventually become better

## HIGH-LEVEL COMPONENT RETRIEVAL RECORDS

### ClassroomList:
* getCurrentUserProfileInfo() -- user document in user collection

### ClassroomStudentView
* getClassroomForUser() -- classroom user doc, classroom doc, decks col (with period query)

### ClassroomTeacherView
* getClassDataRaw() -- data col (with queries)
* getCardAverage() -- retrieves nothing, uses getClassData() result
* getCardsMissedMost() -- retrieves nothing, uses getClassData() result
* getClassroomInfo() -- classroom doc
* getCardsInfo(getCardsMissedMost result) -- multiple card docs
* Promise.all of multiple getDeckInfo(getCardsMissedMost result) -- multiple deck docs

### PeriodTeacherView
* same as ClassroomTeacherView but with Period queries

### DecksTeacherView
* getDecksInClassroom() -- decks col (with period query)
* getClassroomInfo() -- classroom doc

### DeckTeacherView
* getClassDataRaw() -- data col (with queries)
* getCardsMissedMost() -- retrieves nothing, uses getClassData() result
* getCardAverage() -- retrieves nothing, uses getClassData() result
* getDeckInfo() -- deck doc
* getClassroomInfo() -- classroom doc
* getCardsInfo(getCardsMissedMost result) -- multiple card docs
* Promise.all of multiple getDeckInfo(getCardsMissedMost result) -- multiple deck docs

### StudentsTeacherView
* getStudents() -- class user col (with period query)
* getClassroomInfo() -- classroom doc
* getStudentsInfo(getStudents result) --  multiple user ('users' collection) docs

### StudentTeacherView
* getClassDataRaw() -- data col 
* getConsistentLowCards() -- retrieves nothing, uses getClassData() result
* getCardAverage() -- retrieves nothing, uses getClassData() result
* getCardTimeAverage() -- retrieves nothing, uses getClassData() result
* getStudentStudyRatio(getStudentInfo result) -- decks col (with same queries) AND data col
* getStudentInfo -- profile doc AND class user doc
  * break this down into getClassroomUser (from api) and getUserProfileInfo(from api)
* getClassroomInfo() -- classroom doc
* getProfilePic() -- Storage call
* getCardsInfo(getConsistentLowCards result) -- multiple card docs
* Promise.all of multiple getDeckInfo(getConsistentLowCards result) -- multiple deck docs

## Other dev notes

### CLASSROOM PERMISSIONS
Get: classroom teacher and classroom students
Create: teachers only, and teacherId must match teacher UID
Update: teacher only (teacherId)
Delete: None (handled by Functions)

### CLASSROOM USER PERMISSIONS
Get: teacher of user's classroom only
Create: user only. this means user can add themselves to any classroom
Update: None (at the moment)
Delete: teacher of user's classroom only