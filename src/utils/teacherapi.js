import firebase from './firebase';
import 'firebase/firestore';
import shortid from 'shortid';
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

// tool initializations
const db = firebase.firestore();

// For suppressing a console error
const settings = {timestampsInSnapshots: true};
db.settings(settings);


export function getClassrooms() {
  const uid = firebase.auth().currentUser.uid;
  return db.collection('classrooms').where('teacherId', '==', uid).get();
}

/**
 * Gets all students that are in a classroom.
 *
 * @param {String} classroomId The ID of the classroom
 *
 * @return {Object} An array of student objects. Each object has attributes 'period' and 'id', both of type {String}.
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
  })
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
  let colRef = db.collection('classSpacedRepData')
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
 * Gets the lowest rated cards of a classroom. Here, a 
 * "missed" card is defined as a card with a quality 
 * of 2 or under.
 *
 * @param {String} classroomId The ID of the classroom
 *
 * @return An array of card objects. Each object has attributes 'classroomId', 'deckId',
 *    and 'cardId', all of type String.
 */
export function getClassCardsMissedMost(classroomId) {
  // set and get database reference
  let colRef = db.collection('classSpacedRepData')
    .where('classroomId', '==', classroomId)
    .where('quality', '<', 3);
  return colRef.get().then((result) => {
    let badCards = [];
    result.forEach((obj) => {
      badCards.push({
        quality: obj.data().quality,
        classroomId: obj.data().classroomId,
        deckId: obj.data().deckId,
        cardId: obj.data().cardId
      });
    });
    return badCards;
  });
}

export function getPeriodCardsMissedMost(classroomId, period) {
  let colRef = db.collection('classSpacedRepData')
                  .where('classroomId', '==', classroomId)
                  .where('period', '==', period)
                  .where('quality', '<', 3);

  return colRef.get().then((result) => {
    let badCards = [];
    result.forEach((obj) => {
      badCards.push({
        classroomId: obj.data().classroomId,
        deckId: obj.data().deckId,
        cardId: obj.data().cardId
      });
    });
    return badCards;
  });
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
  // getPeriodCardsMissedMost('ABCD1234', '1').then((res) => {
  //   res.forEach((thing) => {
  //     console.log(thing);
  //   })
  // });

  // Promise.all([
  //   getPeriodCardAverage('ABCD1234', '1'),
  //   getClassCardAverage('ABCD1234')
  // ]).then((res) => {
  //   console.log(res[0]);
  //   console.log(res[1]);
  // })
}

main();