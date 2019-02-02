/**
 * The teacherapi.js file contains functions concerning actions that only a teacher would
 *    take; i.e. analytics and higher-level classroom retrieval.
 *
 * @author Michael Fan
 */

import firebase from './firebase';
import 'firebase/firestore';
import shortid from 'shortid';
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

// tool initializations
const db = firebase.firestore();

// For suppressing a console error
const settings = {timestampsInSnapshots: true};
db.settings(settings);

/**
 * Gets all classrooms of a student. This function gets the teacher's ID from the active user
 *    session.
 * 
 * @return the Promise returned by the DB call for this function.
 */
export function getClassrooms() {
  const uid = firebase.auth().currentUser.uid;
  return db.collection('classrooms').where('teacherId', '==', uid).get();
}

/**
 * Gets all students that are in a classroom.
 *
 * @param {String} classroomId The ID of the classroom
 *
 * @return {Object} An array of student objects. Each object has attributes 'period' and 'id',
 *    both of type {String}.
 */
export function getClassStudents(classroomId) {
  let colRef = db.collection('classrooms').doc(classroomId).collection('users');
  
  return colRef.get().then((result) => {
    let ids = [];
    result.forEach((studentDataObject) => {
      ids.push({
        period: studentDataObject.data().period,
        id: studentDataObject.id
      });
    });

    return ids;
  });
}

/**
 * Gets all students that are in a classroom period.
 *
 * @param {String} classroomId The ID of the classroom
 * @param {String} period The desired period
 *
 * @return An promise resolving to an array of student objects.
 *    Each object has attributes 'period' and 'id', both of
 *    type {String}.
 */
export function getPeriodStudents(classroomId, period) {
  let colRef = db.collection('classrooms').doc(classroomId).collection('users').where('period', '==', period);

  return colRef.get().then((result) => {
    let ids = [];
    result.forEach((studentDataObject) => {
      ids.push({
        period: studentDataObject.data().period,
        id: studentDataObject.id
      });
    });

    return ids;
  });
}

/**
 * Gets profile information of a student.
 *
 * @param {String} userId - The ID of the student
 *
 * @return An promise resolving to an array of student objects.
 *    Each object has attributes 'period' and 'id', both of
 *    type {String}.
 */
export function getStudentInfo(userId, classroomId) {
  const profileRef = db.collection('users').doc(userId);
  const classProfileRef = db.collection('classrooms').doc(classroomId)
    .collection('users').doc(userId);
  return Promise.all([
    profileRef.get(),
    classProfileRef.get()
  ]).then((res) => {
    const [profile, classProfile] = res;
    return {
      id: userId,
      name: profile.data().name,
      email: profile.data().email,
      period: classProfile.data().period
    };
  });
}

/**
 * Gets info for multiple students
 *
 * @param {String} students - an array of userId's, belonging to students
 *
 * @return {Object} An object with userId's of type String as the keys, and an object with
 *    attributes 'name' and 'email' as the values
 */
export function getStudentsInfo(students) {
  // set up for Promise.all call to get student documents
  const calls = [];
  students.forEach((student) => {
    const userRef = db.collection('users').doc(student);
    calls.push(userRef.get());
  });

  // get card documents
  return Promise.all(calls).then((result) => {
    const toReturn = {};
    result.forEach((res, i) => {
      toReturn[students[i]] = {
        name: res.data().name,
        email: res.data().email
      };
    });
    return toReturn;
  });
}

/**
 * Gets the average card rating of a classroom.
 *
 * @param {String} classroomId The ID of the classroom
 *
 * @return The average card rating of a classroom, a number of type int.
 */
export function getClassCardAverage(classroomId) {
  let colRef = db.collection('classSpacedRepData').where('classroomId', '==', classroomId);

  return colRef.get().then((result) => {
    let accumulation = 0;
    let count = 0;
    result.forEach((dataPoint) => {
      accumulation += dataPoint.data().quality;
      count++;
    });
    return count == 0 ? accumulation : (accumulation/count);
  });
}

/**
 * Gets the average card rating of a classroom.
 *
 * @param {String} classroomId The ID of the classroom
 * @param {String} period The desired period
 *
 * @return The average card rating of a classroom, a number of type int.
 */
export function getPeriodCardAverage(classroomId, period) {
  const colRef = db.collection('classSpacedRepData')
    .where('classroomId', '==', classroomId)
    .where('period', '==', period);

  return colRef.get().then((result) => {
    let accumulation = 0;
    let count = 0;
    result.forEach((dataPoint) => {
      accumulation += dataPoint.data().quality;
      count++;
    });
    return count == 0 ? accumulation : (accumulation/count);
  });
}

/**
 * Gets the average card rating of a deck, filtered by classroom or period.
 *
 * @param {String} deckId - The ID of the deck
 * @param {String} classroomId - (Optional) The ID of the classroom to filter results by
 * @param {String} period - (Optional) The ID of the period to filter results by
 *
 * @return The average card rating of a deck, filtered by classroom or period. This will be a
 *    number of type int.
 */
export function getDeckCardAverage(deckId, classroomId, periodId) {
  // classroomId may not be necessary
}

/**
 * Gets the average card rating of a deck, filtered by classroom or period.
 *
 * @param {String} deckId - The ID of the deck
 * @param {String} classroomId - (Optional) The ID of the classroom to filter results by
 * @param {String} period - (Optional) The ID of the period to filter results by
 *
 * @return The average card rating of a deck, filtered by classroom or period. This will be a
 *    number of type int.
 */
export function getStudentCardAverage(userId, classroomId) {
  const colRef = db.collection('classSpacedRepData')
    .where('userId', '==', userId)
    .where('classroomId', '==', classroomId);

  return colRef.get().then((result) => {
    let accumulation = 0;
    let count = 0;
    result.forEach((dataPoint) => {
      accumulation += dataPoint.data().quality;
      count++;
    });
    return count == 0 ? accumulation : (accumulation/count);
  });
}

/**
 * Gets the lowest rated cards of a classroom. Here, a 
 * "missed" card is defined as a card with a quality 
 * of 2 or under.
 *
 * @param {String} classroomId The ID of the desired classroom
 *
 * @return A Promise resolving with an array of card objects. Each object has attributes
 *    'classroomId', 'deckId', 'cardId', 'userId', and 'period' of type String, and
 *    'averageQuality', of type number.
 */
export function getClassCardsMissedMost(classroomId) {
  // set and get database reference
  let colRef = db.collection('classSpacedRepData')
    .where('classroomId', '==', classroomId)
    .where('quality', '<', 3);
  return colRef.get().then((result) => {
    return calculateCardAverages(result);
  });
}

/**
 * Gets the lowest rated cards of a period. Here, a 
 * "missed" card is defined as a card with a quality 
 * of 2 or under.
 *
 * @param {String} classroomId - The ID of the desired classroom
 * @param {String} period - The desired period
 *
 * @return A Promise resolving to an array of card objects. Each object has attributes
 *    'classroomId', 'deckId', 'cardId', and 'averageQuality', all of type String.
 */
export function getPeriodCardsMissedMost(classroomId, period) {
  // set and get database reference
  let colRef = db.collection('classSpacedRepData')
    .where('classroomId', '==', classroomId)
    .where('period', '==', period)
    .where('quality', '<', 3);
  return colRef.get().then((result) => {
    return calculateCardAverages(result);
  });
}

/**
 * Gets the lowest rated cards of a deck. Here, a 
 * "missed" card is defined as a card with a quality 
 * of 2 or under. This can be filtered by classroom or period.
 *
 * @param {String} deckId - The ID of the deck
 * @param {String} classroomId - (Optional) The ID of the desired classroom
 * @param {String} period - (Optional) The desired period
 *
 * @return A Promise resolving to an array of card objects. Each object has attributes
 *    'classroomId', 'deckId', 'cardId', and 'averageQuality', all of type String.
 */
export function getDeckCardsMissedMost(deckId, classroomId, period) {

}

/**
 * Gets a student's "study ratio" -- the number of cards the student has studied, and the number
 *    of all cards available to the student (the number of all cards in all decks assigned to
 *    the student's period). 
 *
 * @param {String} classroomId - the ID of the student's classroom
 * @param {String} userId - the ID of the student
 * @param {String} period - The student's period
 *
 * @return A Promise resolving to an array where the first element is the number of cards the
 *    student has studied, and the second element is the number of all cards available to the
 *    student (the number of all cards in all decks assigned to the student's period).
 */
export function getStudentStudyRatio(classroomId, userId, period) {
   
}

/**
 * Gets a student's consistently low cards. A card's "consistent" rating is all ratings' mode,
 *    but only if:
 *    ( allRatings.count(mode(allRatings)) / allRatings.size ) >= 0.40
 * And a low rating is defined as a rating <= 2.
 *
 * For more information on "consistent" ratings, see
 *    https://docs.google.com/document/d/1U2vdl62Ae9HiT7krRUAPuhKaphRIHhufQNsnI9eS4YE/edit?disco=AAAACC24TFw
 *
 * @param {String} classroomId - the ID of the student's classroom
 * @param {String} userId - the ID of the student
 * @param {String} period - The student's period
 *
 * @return A Promise resolving to an array of the student's consistently low cards. A card object
 *    has the structure:
 *    TODO: fillout
 */
export function getStudentLowCards(classroomId, userId, period) {
  // may require helper functions
}



/**
 * Calculates card quality averages, given a Firebase collection result object
 *    of class data points. Helper function for functions getting missed-most
 *    cards.
 *
 * @param {String} col - a Firebase collection result object of class data points
 *
 * @return An array of card objects. Each object has attributes 'classroomId', 'deckId',
 *    'cardId', and 'averageQuality', all of type String.
 */
function calculateCardAverages(col) {
  // split col's datapoints by card
  let cardRecord = {};
  col.forEach((dataPtSnap) => {
    const cardId = dataPtSnap.data().cardId;
    // if cardRecord does not have this card yet
    if (!cardRecord[cardId]) {
      cardRecord[cardId] = [dataPtSnap];
    } else {
      // add this data point to cardRecord
      cardRecord[cardId].push(dataPtSnap);
    }
  });

  // calculate average rating of every card in cardRecord
  let badCards = [];
  Object.keys(cardRecord).forEach((key) => {
    const cardObj = cardRecord[key];
    let sum = 0;
    cardObj.forEach((dataPoint) => {
      sum += dataPoint.data().quality;
    });
    let average = sum / cardObj.length;
    let badCardObj = cardObj[0].data();
    delete badCardObj.time;
    delete badCardObj.timestamp;
    delete badCardObj.quality;
    badCardObj.averageQuality = average;
    badCards.push(badCardObj);
  });

  // sort bad cards by their average rating
  badCards.sort((card1, card2) => {
    return card2.averageQuality - card1.averageQuality;
  });
  return badCards;
}

export function createClassroom(name, periods) {
  const uid = firebase.auth().currentUser.uid;
  const ref = db.collection('classrooms').doc(shortid.generate());
  return ref.set({
    name: name,
    periods: periods,
    teacherId: uid
  });
}

export function createJoinCode(id, period) {
  return `${id}-&${period}`;
}

function main() {
  getClassCardsMissedMost('ABCD1234').then((res) => {
    res.forEach((thing) => {
      console.log(thing);
    })
  });
}

// main();