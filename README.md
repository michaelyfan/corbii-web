# corbii-web
Corbii's web platform.

@maintainers: Check the Zenhub board for TODOs.

## New TODOs


## Development instructions

To start a development environment:

1. Clone this repo
1. Install dependencies (`npm i`)
1. Start the webpack development server with `npm run dev`
1. Code away
   * If you need to deploy something to the Firebase dev project (Firestore rules, new Functions, etc), make sure you are deploying to the `corbii-web-dev` Firebase project and run `firebase deploy --only [firebase-service-name-here]`
      * ex. to deploy new Firestore rules, run `firebase deploy --only firestore`
      * refer to the [Firebase CLI](https://firebase.google.com/docs/cli/) docs for more info

The webpack development server comes with hot reloading.

## Deployment/Production Specifications

The `master` branch of `corbii-web` is the **production branch**. Do not push anything to master that is not ready for production; always use feature branches.

The `corbii-web` Firebase project is used for the `master` branch, while any development branch should use the `corbii-web-dev` Firebase project. The Firebase CLI allows for the `corbii-web` repo to freely switch between both Firebase projects, a feature known as 'aliases'.

1. Ensure you are on master
1. Build the app with `npm run build`
1. Switch to the correct Firebase alias (either `firebase use dev` or `firebase use default`) to determine whether to push to the development environment or the dev environment
1. Deploy the app on Firebase Hosting with `firebase deploy`

*Note that anything deployed via* `corbii-web-dev`*'s Firebase Hosting will use* `corbii-web`*'s services (ex. users and database) while deployed. This is not ideal, and will be changed in the future (see [#108](https://github.com/michaelyfan/corbii-web/issues/108)).*

This app used to use Heroku, but that's behind us now.

## DEVELOPER REFERENCE
The notes below are for developer reference.

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