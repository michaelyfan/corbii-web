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
const functions = firebase.functions();

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
 * Gets all students that are in a classroom, and period if desired. This function
 *   also gets the students' profile information.
 *
 * @param {String} classroomId - The ID of the classroom
 * @param {String} period - (Optional) The desired period
 * @param {String} returnAsObject - (Optional) If true, returns result as an object mapping
 *                                student UIDs to student objects instead of as an array
 *                                of student objects. 
 *
 * @return {Object} An array of student objects. Each object has attributes 'period', 'id',
 *                     'name', and 'email' all of type String. If returnAsObject is true,
 *                     an object is returned instead, where student IDs are mapped to the
 *                     aforementioned student objects.
 */
export async function getStudentsFull(classroomId, period, returnAsObject) {
  try {
    const students = await getStudents(classroomId, period);
    const userIds = students.map((student) => {
      return student.id;
    });
    const studentsInfo = await getStudentsInfo(userIds);

    if (returnAsObject === true) {
      const toReturn = {};
      students.forEach((student) => {
        toReturn[student.id] = {
          id: student.id,
          period: student.period,
          name: studentsInfo[student.id].name,
          email: studentsInfo[student.id].email
        };
      });
      return toReturn;
    } else {
      const toReturn = students.map((student) => {
        return {
          id: student.id,
          period: student.period,
          name: studentsInfo[student.id].name,
          email: studentsInfo[student.id].email
        };
      });
      return toReturn;
    }
  } catch (e) {
    return Promise.reject(e);
  }
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
    if (!profile.exists) {
      throw new Error('This user does not exist.');
    }
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

  // get student documents
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

export function createClassroom(name, periods) {
  const uid = firebase.auth().currentUser.uid;
  const ref = db.collection('classrooms').doc(shortid.generate());
  return ref.set({
    name: name,
    periods: periods,
    teacherId: uid
  });
}

/**
 * Updates classroom doc in the DB with the new specified information.
 * @param  {String} classroomId -- The ID of the classroom to update.
 * @param  {String} (Optional) name -- The new desired name of the classroom.
 * @param  {Array} (Optional) periods -- Periods to add to this classroom. If this array contains periods that
 *                            are already in the classroom, they will have no effect.
 * @return {Promise} -- A Promise resolving to the result of the Firestore call.
 */
export function updateClassroom(classroomId, name, periods) {
  // check for null parameters
  if (classroomId == null) {
    return Promise.reject(new Error('updateClassroom was called with null classroomId, aborting...'));
  }

  // check for name and periods both null -- in this case do nothing
  if (name == null && periods == null) {
    return Promise.resolve('No new classroom attributes provided -- nothing updated.');
  }

  // create Firestore reference
  const ref = db.collection('classrooms').doc(classroomId);

  if (periods) {
    // run a Firestore transaction to get periods array
    return db.runTransaction((trans) => {
      return trans.get(ref).then((classroomDoc) => {
        if (!classroomDoc.exists) {
          throw 'updateClassroom attempted to update nonexistant classroom, aborting...';
        }

        // construct new periods array
        const existingPeriods = classroomDoc.data().periods;
        periods.forEach((period) => {
          // before comparing periods, parse period to string just in case
          const periodAsString = period + '';
          if (!existingPeriods.includes(periodAsString)) {
            existingPeriods.push(periodAsString);
          }
        });

        if (name) { // case where both name and periods are defined
          trans.update(ref, {
            name,
            periods: existingPeriods
          });
        } else { // case where just periods is defined
          trans.update(ref, { periods: existingPeriods });
        }
      });
    });
  } else { // name is defined and periods is null
    // just update classroom name
    return ref.update({ name });
  }
}

/**
 * Updates the periods available to a deck.
 *
 * @param {String} deckId -- the deckId of this deck
 * @param {array} periods -- a periods object to update this deck with. structure
 *    is:
 {
  'period key here': boolean
 }
 *
 * @return a Promise resolving to a successful Firebase update result
 */
export function updateDeckPeriods(deckId, periods) {
  const docRef = db.collection('decks').doc(deckId);

  return docRef.update({
    periods: periods
  });
}

/**
 * Deletes the specified user from the specified classroom.
 * @param  {String} classroomId -- The ID of the classroom.
 * @param  {String} userId -- The ID of the user to delete from the classroom.
 * @return {Promise}  A Promise resolving to the result of the Firestore delete call.
 */
export function deleteStudent(classroomId, userId) {
  // check for null params
  if (classroomId == null || userId == null) {
    return Promise.reject('deleteStudent missing one or more required params, aborting...');
  }

  const ref = db.collection('classrooms').doc(classroomId)
    .collection('users').doc(userId);

  return ref.delete();
}

/**
 * Deletes the specified classroom. In order for a classroom to be deleted, the classroom must
 * have no students assigned to it; to delete a classroom, students must be deleted first.
 *
 * Due to serverless cold starts, this function may have a long compute time before promise
 * resolution/rejection.
 *
 * @param  {String} classroomId -- The ID of the desired classroom
 * 
 * @return {Promise} -- a Promise resolving to the result of the call, or rejecting.
 */
export function deleteClassroom(classroomId) {
  // get the cloud function from Firebase and call it
  const deleteClassroom = functions.httpsCallable('deleteClassroom');
  return deleteClassroom({ classroomId });
}

/**
 * Deletes the specified period from the specified classroom. In order for a period to be deleted,
 * the period must have no students assigned to it; to delete a period, its students must be
 * deleted.
 *   
 * Due to serverless cold starts, this function may have a long compute time before promise
 * resolution/rejection.
 *
 * @param  {String} classroomId -- The ID of the desired classroom
 * @param  {String} period -- The desired period to delete
 * 
 * @return {Promise} -- a Promise resolving to the result of the call, or rejecting.
 */
export function deletePeriod(classroomId, period) {
  // get the cloud function from Firebase and call it
  const deletePeriod = functions.httpsCallable('deletePeriod');
  return deletePeriod({ classroomId, period });
}

/**
 * @summary a utility function that creates a classroom join code
 * @param  {String} id     The ID of this classroom
 * @param  {String} period The period to which the desired join code will apply
 * @return {String}        A join code for this classroom for the specified period
 */
export function createJoinCode(id, period) {
  return `${id}-&${period}`;
}

/**
 * Generic function to get class data points.
 *
 * @param {String} classroomId - The ID of the datapts' classroom
 * @param {String} period - (Optional) The period of the datapts
 * @param {String} deckId - (Optional) The ID of the datapts' deck
 * @param {String} userId - (Optional) The ID of the datapts' user
 *
 * @return A Promise resolving to a Firebase QuerySnapshot object with the retrieved data points.
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
 * @return A Promise resolving to a Firebase QuerySnapshot object with the retrieved data points.
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
 * Filters data points based on provided filter options. The data points operated on by this
 *    function is a Firebase collection object. If no filter options are provided or filterOptions
 *    is null, this function returns a copy of the original data.
 *
 * @param {Object} filterOptions - an object containing filtering options for the datapoints
 * @param {String} filterOptions.classroomId - (Optional) The ID of the datapts' classroom.
 * @param {String} filterOptions.period - (Optional) The period of the datapts
 * @param {String} filterOptions.deckId - (Optional) The ID of the datapts' deck
 * @param {String} filterOptions.userId - (Optional) The ID of the datapts' user
 * @param {Array} filterOptions.times - (Optional) Times to filter the datapts, where times[0] is
 *    the start time (number in unix epoch time) and times[1] is the end time (number in unix
 *    epoch time)
 * @param {Object} data - A Firebase collection result object containing the data to filter.
 *
 * @return An array of filtered data points. Note that this function is synchronous.
 */
export function filterClassDataRaw(filterOptions, data) {
  // declare array to return
  const filteredDocs = [];

  if (data != null) {
    // iterate through data points and pick out points that pass filters
    data.forEach((datapoint) => {
      // add this datapoint if filterOptions is null (there aren't any filters)
      if (filterOptions === null) {
        filteredDocs.push(datapoint);
        return;
      }
      const { classroomId, period, deckId, userId, times } = filterOptions;
      if (classroomId != null && datapoint.data().classroomId !== classroomId) {
        return; // filter out this point if classroomId doesn't match
      }
      if (period != null && datapoint.data().period !== period) {
        return; // filter out this point if period doesn't match
      }
      if (deckId != null && datapoint.data().deckId !== deckId) {
        return; // filter out this point if deckId doesn't match
      }
      if (userId != null && datapoint.data().userId !== userId) {
        return; // filter out this point if userId doesn't match
      }
      if (times != null && times.length === 2) {
        // filter out this point if it isn't within the requested timerange
        const thisUnix = datapoint.data().timestamp.seconds;
        if (!(thisUnix >= times[0] && thisUnix <= times[1])) {
          return;
        }
      }
      filteredDocs.push(datapoint);
    });
    return filteredDocs;
  }
  return null;
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
 * Gets the lowest rated cards of a classroom.
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
 *    'averageQuality', of type number. The array contains only unique cards; in other words,
 *    no two elements will have the same attribute value for 'cardId'.
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
 * @param {String} queryOptions.classroomId - the ID of the student's classroom
 * @param {String} queryOptions.userId - the ID of the student
 * @param {String} queryOptions.period - the period of this student
 * @param {String} (Optional) queryOptions.deckId - the deck by which to filter these results
 * @param {Object} data - (Optional) A Firebase collection result object containing the data
 *    points that will be used in this function. If both this and retrievedDecks are supplied,
 *    then queryOptions is not necessary.
 * @param {Object} retrievedDecks - (Optional) A Firebase QuerySnapshot or an array containing
 *                                the decks that will be used in this function. If both this and
 *                                data are supplied, then queryOptions is not necessary.
 *
 * @return A Promise resolving to an array where the first element is the number of cards the
 *    student has studied, and the second element is the number of all cards available to the
 *    student (the number of all cards in all decks assigned to the student's period).
 */
export async function getStudentStudyRatio(queryOptions, data, retrievedDecks) {
  const uid = firebase.auth().currentUser.uid;

  // check for null query options; only matters if either data or retrievedDecks were not supplied
  let classroomId, period, deckId, userId;
  if (!data || !retrievedDecks) {
    if (queryOptions == null) {
      return Promise.reject('queryOptions cannot be null if data or deck data aren\'t provided, aborting...');
    }
    ({ classroomId, period, deckId, userId } = queryOptions);
    if (classroomId == null) {
      return Promise.reject('classroomId cannot be null if data or deck data aren\'t provided, aborting...');
    }
    if (userId == null) {
      return Promise.reject('userId cannot be null if data or deck data aren\'t provided, aborting...');
    }
    if (period == null) {
      return Promise.reject('period cannot be null if data or deck data aren\'t provided, aborting...');
    }
  }

  // get all datapoints applicable to this user in this classroom
  let dataRes;
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

  // get all decks available to this user in this classroom
  let decksRes;
  if (retrievedDecks) {
    decksRes = retrievedDecks;
  } else {
    let decksRef;
    if (deckId) {
      decksRef = db.collection('decks').doc(deckId);
    } else {
      decksRef = db.collection('decks')
        .where('creatorId', '==', uid) // creatorId necessary for Firebase query security
        .where('classroomId', '==', classroomId)
        .where(`periods.${period}`, '==', true);
    }
    try {
      decksRes = await decksRef.get();
      if (deckId) { // place deckRes into an array to mimic Firestore collection retrieval
        decksRes = [ decksRes ];
      }
    } catch (e) {
      return Promise.reject(e);
    }
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