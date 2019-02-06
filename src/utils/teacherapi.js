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
 * Generic function to get class data points.
 *
 * @param {String} classroomId - The ID of the datapts' classroom
 * @param {String} period - (Optional) The period of the datapts
 * @param {String} deckId - (Optional) The ID of the datapts' deck
 * @param {String} userId - (Optional) The ID of the datapts' user
 *
 * @return The average card rating of a given filter of card data points, of type number.
 */
export function getClassData(classroomId, period, deckId, userId) {
  // set db reference
  let colRef = db.collection('classSpacedRepData').where('classroomId', '==', classroomId);
  if (period && userId == null) {
    colRef = colRef.where('period', '==', period);
  }
  if (deckId) {
    colRef = colRef.where('deckId', '==', deckId);
  }
  if (userId) {
    colRef = colRef.where('userId', '==', userId);  
  }

  // get db reference and filter before sending back
  return colRef.get().then((res) => {
    const toReturn = [];
    res.forEach((datapt) => {
      const data = datapt.data();
      data.id = datapt.id;
      toReturn.push(data);
    });
    return toReturn;
  });
}

/**
 * Generic function to get class data points 'raw' -- class data will be returned as a Firebase
 *    result, without the formatting step done by getClassData().
 *
 * @param {String} classroomId - The ID of the datapts' classroom
 * @param {String} period - (Optional) The period of the datapts
 * @param {String} deckId - (Optional) The ID of the datapts' deck
 * @param {String} userId - (Optional) The ID of the datapts' user
 *
 * @return The average card rating of a given filter of card data points, of type number.
 */
export function getClassDataRaw(classroomId, period, deckId, userId) {
  // set db reference
  let colRef = db.collection('classSpacedRepData').where('classroomId', '==', classroomId);
  if (period && userId == null) {
    colRef = colRef.where('period', '==', period);
  }
  if (deckId) {
    colRef = colRef.where('deckId', '==', deckId);
  }
  if (userId) {
    colRef = colRef.where('userId', '==', userId);  
  }

  return colRef.get();
}

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
 * Gets all students that are in a classroom, and period if desired.
 *
 * @param {String} classroomId - The ID of the classroom
 * @param {String} period - (Optional) The desired period
 *
 * @return {Object} An array of student objects. Each object has attributes 'period' and 'id',
 *    both of type {String}.
 */
export function getStudents(classroomId, period) {
  let colRef = db.collection('classrooms').doc(classroomId).collection('users');
  if (period) {
    colRef = colRef.where('period', '==', period);
  }
  
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
 * Gets profile information of a student, including a student's period.
 *
 * @param {String} userId - The ID of the student
 *
 * @return An promise resolving to an array of student objects.
 *    Each object has attributes 'period' and 'id', both of
 *    type {String}.
 */
export function getStudentInfo(classroomId, userId) {
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
 * Gets info for multiple students. This does not include the students' periods.
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
 * Gets an average card rating of a given filter of cards data points.
 *
 * @param {Object} queryOptions - an object containing querying options for the datapoints. Can be
 *    interpreted as options for the datapoints acted on by this function
 * @param {String} queryOptions.classroomId - (Optional) The ID of the datapts' classroom. This is
 *    required if data is null.
 * @param {String} queryOptions.period - (Optional) The period of the datapts
 * @param {String} queryOptions.deckId - (Optional) The ID of the datapts' deck
 * @param {String} queryOptions.userId - (Optional) The ID of the datapts' user
 * @param {Object} data - (Optional) A Firebase collection result object containing the data
 *    points that will be used to calculate the card average. queryOptions will be ignored if
 *    data is passed in.
 *
 * @return The average card rating of a given filter of card data points, of type number.
 */
export async function getCardAverage(queryOptions, data) {
  let result;
  if (data) {
    // if data exists, set result to data and skip DB retrieval
    result = data;
  } else {
    // check for null query options
    if (queryOptions == null) {
      return Promise.reject('queryOptions cannot be null if no data is passed in. Aborting...');
    }
    const { classroomId, period, deckId, userId } = queryOptions;
    if (classroomId == null) {
      return Promise.reject('classroomId cannot be null if no data is passed in. Aborting...');
    }

    // set db reference based on query options and get
    let colRef = db.collection('classSpacedRepData').where('classroomId', '==', classroomId);
    if (period && userId == null) {
      colRef = colRef.where('period', '==', period);
    }
    if (deckId) {
      colRef = colRef.where('deckId', '==', deckId);
    }
    if (userId) {
      colRef = colRef.where('userId', '==', userId);  
    }
    try {
      result = await colRef.get();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  let accumulation = 0;
  let count = 0;
  result.forEach((dataPoint) => {
    accumulation += dataPoint.data().quality;
    count++;
  });
  return count == 0 ? accumulation : (accumulation/count);
}

/**
 * Gets an average card time of a given filter of cards data points.
 *
 * @param {Object} queryOptions -- an object containing querying options for the datapoints acted
 *    on by this function. This parameter will be ignored if data is passed in.
 * @param {String} queryOptions.classroomId (Optional) The ID of the desired classroom
 * @param {String} queryOptions.period - (Optional) The desired period. This parameter is disregarded if userId
 *    is passed in.
 * @param {String} queryOptions.deckId - (Optional) The ID of the datapts' deck
 * @param {String} queryOptions.userId - (Optional) The ID of the datapts' user
 * @param {Object} data (Optional) - A Firebase collection result object containing the data
 *    points that will be used in this function. queryOptions will be ignored if
 *    data is passed in.
 *
 * @return The average card time of a given filter of card data points, of type number.
 */
export async function getCardTimeAverage(queryOptions, data) {
  let result;
  if (data) {
    result = data;
  } else {
    // check for null query options
    if (queryOptions == null) {
      return Promise.reject('queryOptions cannot be null if no data is passed in. Aborting...');
    }
    const { classroomId, period, deckId, userId } = queryOptions;
    if (classroomId == null) {
      return Promise.reject('classroomId cannot be null if no data is passed in. Aborting...');
    }

    // set db reference based on query options and get
    let colRef = db.collection('classSpacedRepData').where('classroomId', '==', classroomId);
    if (period && userId == null) {
      colRef = colRef.where('period', '==', period);
    }
    if (deckId) {
      colRef = colRef.where('deckId', '==', deckId);
    }
    if (userId) {
      colRef = colRef.where('userId', '==', userId);  
    }
    try {
      result = await colRef.get();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  let accumulation = 0;
  let count = 0;
  result.forEach((dataPoint) => {
    accumulation += dataPoint.data().time;
    count++;
  });
  return count == 0 ? accumulation : (accumulation/count);
}

/**
 * Gets the lowest rated cards of a classroom. Here, a 
 * "missed" card is defined as a card with a quality 
 * of 2 or under. 
 *
 * @param {Object} queryOptions -- an object containing querying options for the datapoints acted
 *    on by this function. This parameter will be ignored if data is passed in.
 * @param {String} queryOptions.classroomId (Optional) The ID of the desired classroom
 * @param {String} queryOptions.period - (Optional) The desired period. This parameter is disregarded if userId
 *    is passed in.
 * @param {String} queryOptions.deckId - (Optional) The ID of the datapts' deck
 * @param {String} queryOptions.userId - (Optional) The ID of the datapts' user
 * @param {Object} data (Optional) - A Firebase collection result object containing the data
 *    points that will be used in this function. queryOptions will be ignored if
 *    data is passed in.
 *
 * @return A Promise resolving with an array of card objects. Each object has attributes
 *    'classroomId', 'deckId', 'cardId', 'userId', and 'period' of type String, and
 *    'averageQuality', of type number.
 */
export async function getCardsMissedMost(queryOptions, data) {
  let result;
  if (data) {
    result = data;
  } else {
    // check for null query options
    if (queryOptions == null) {
      return Promise.reject('queryOptions cannot be null if no data is passed in. Aborting...');
    }
    const { classroomId, period, deckId, userId } = queryOptions;
    if (classroomId == null) {
      return Promise.reject('classroomId cannot be null if no data is passed in. Aborting...');
    }

    // set db reference based on query options and get
    let colRef = db.collection('classSpacedRepData').where('classroomId', '==', classroomId);
    if (period && userId == null) {
      colRef = colRef.where('period', '==', period);
    }
    if (deckId) {
      colRef = colRef.where('deckId', '==', deckId);
    }
    if (userId) {
      colRef = colRef.where('userId', '==', userId);  
    }
    try {
      result = await colRef.get();
    } catch (e) {
      return Promise.reject(e);
    }
  }
  return Promise.resolve(calculateCardAverages(result));
}

/**
 * Gets consistently low cards. A card's "consistent" rating is all ratings' statistical
 *    mode, but only if:
 *    ( allRatings.count(mode(allRatings)) / allRatings.size ) >= 0.40
 * And a low rating is defined as a rating <= 2.
 *
 * For more information on "consistent" ratings, see
 *    https://docs.google.com/document/d/1U2vdl62Ae9HiT7krRUAPuhKaphRIHhufQNsnI9eS4YE/edit?disco=AAAACC24TFw
 *
 * @param {Object} queryOptions -- an object containing querying options for the datapoints acted
 *    on by this function. This parameter will be ignored if data is passed in.
 * @param {String} queryOptions.classroomId - the ID of the student's classroom
 * @param {String} queryOptions.userId - (Optional) the ID of the student
 * @param {String} queryOptions.period - (Optional) The student's period
 * @param {Object} data (Optional) - A Firebase collection result object containing the data
 *    points that will be used in this function. queryOptions will be ignored if
 *    data is passed in.
 *
 * @return A Promise resolving to an array of the student's consistently low cards. Each object has
 *    attributes 'cardId', 'deckId', 'classroomId', and 'userId' of type String, and 'quality'
 *    of type number.
 */
export async function getConsistentLowCards(queryOptions, data) {
  let result;
  if (data) {
    result = data;
  } else {
    // check for null query options
    if (queryOptions == null) {
      return Promise.reject('queryOptions cannot be null if no data is passed in. Aborting...');
    }
    const { classroomId, period, deckId, userId } = queryOptions;
    if (classroomId == null) {
      return Promise.reject('classroomId cannot be null if no data is passed in. Aborting...');
    }

    // set db reference based on query options and get
    let colRef = db.collection('classSpacedRepData').where('classroomId', '==', classroomId);
    if (period && userId == null) {
      colRef = colRef.where('period', '==', period);
    }
    if (deckId) {
      colRef = colRef.where('deckId', '==', deckId);
    }
    if (userId) {
      colRef = colRef.where('userId', '==', userId);  
    }
    try {
      result = await colRef.get();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  const toReturn = [];
  const cardRecord = {};
  // organize datapoints by card
  result.forEach((datapoint) => {
    if (!cardRecord[datapoint.data().cardId]) {
      cardRecord[datapoint.data().cardId] = [datapoint];
    } else {
      cardRecord[datapoint.data().cardId].push(datapoint);
    }
  });

  // iterate through all cards to find consistent rating (if any)
  Object.keys(cardRecord).forEach((key) => {
    const datapoints = cardRecord[key];
    // find statistical mode of all datapoints (by quality)
    const modeMap = {};
    let mode = datapoints[0].data().quality, maxCount = 1;
    datapoints.forEach((point) => {
      const thisPointQuality = point.data().quality;
      if (modeMap[thisPointQuality] == null) 
        modeMap[thisPointQuality] = 1;
      else
        modeMap[thisPointQuality] += 1;
      if (modeMap[thisPointQuality] > maxCount) {
        mode = thisPointQuality;
        maxCount = modeMap[thisPointQuality];
      }
    });

    // determine if this mode is low enough to be low quality (<= 2)
    if (mode <= 2) {
      // determine if this mode is consistent
      if ((maxCount / datapoints.length) >= 0.4) {
        toReturn.push({
          cardId: datapoints[0].data().cardId, // any of the datapoints will have this card's ID
          deckId: datapoints[0].data().deckId, // any of the datapoints will have this card's deck's ID
          quality: mode,
          classroomId: datapoints[0].data().classroomId, // any of the datapoints will have this card's classroom TODO: verify
          userId: queryOptions && queryOptions.userId ? queryOptions : null
        });
      }
    }
  });
  return toReturn;
}

/**
 * Gets a student's "study ratio" -- the number of cards the student has studied, and the number
 *    of all cards available to the student (the number of all cards in all decks assigned to
 *    the student's period). 
 *
 * @param {String} classroomId - the ID of the student's classroom
 * @param {String} userId - the ID of the student
 * @param {String} period - the period of this student
 * @param {Object} data - (Optional) A Firebase collection result object containing the data
 *    points that will be used in this function. Unlike other functions, other params will still
 *    be used for the decksRef
 *
 * @return A Promise resolving to an array where the first element is the number of cards the
 *    student has studied, and the second element is the number of all cards available to the
 *    student (the number of all cards in all decks assigned to the student's period).
 */
export async function getStudentStudyRatio(classroomId, userId, period, data) {
  let dataRes;
  let decksRes;
  if (data) {
    dataRes = data;
  } else {
    const dataRef = db.collection('classSpacedRepData')
      .where('classroomId', '==', classroomId)
      .where('userId', '==', userId);
    try {
      dataRes = await dataRef.get();
    } catch (e) {
      return Promise.reject(e);
    }
  }
  
  const decksRef = db.collection('decks')
    .where('isClassroomPrivate', '==', true)
    .where('classroomId', '==', classroomId)
    .where(`periods.${period}`, '==', true);
  try {
    decksRes = await decksRef.get();
  } catch (e) {
    return Promise.reject(e);
  }
  // count the number of cards among retrieved datapoints
  const cardRecord = {};
  dataRes.forEach((datapt) => {
    if (!cardRecord[datapt.data().cardId]) {
      cardRecord[datapt.data().cardId] = true;
    }
  });
  // sum up the number of cards in retrieved decks
  let numCards = 0;
  decksRes.forEach((deck) => {
    numCards += deck.data().count;
  });
  return Promise.resolve([Object.keys(cardRecord).length, numCards]);
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

async function main() {
  const classroomId = '1234';
  const deckId = '5678';
  const x = {classroomId, deckId};
  console.log(x);
  // getCardAverage({classroomId: 'ABCD1234'}).then((res => {
  //   console.log(res);
  // })).catch(err => {
  //   console.error('Error:', err);
  // });

  // getClassDataRaw('ABCD1234').then((res) => {
  //   return getCardAverage(null, res);
  // }).then((res) => {
  //   console.log(res);
  // }).catch((err) => {
  //   console.log('Error:', err);
  // });

}

// main();