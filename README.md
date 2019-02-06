# corbii-web
Corbii's web platform.

Check the Zenhub board for TODOs.

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