/**
 * This is a tester class for teacherapi. This function has no production use.
 */

import { deleteClassroom } from './teacherapi.js';

async function main() {
  // teacherId: tVSwbCe263gMxkCrTlRY9nNCUCJ2
  
  const trialA = null;
  const trialB = 'asdf';
  const trialC = 'ZIAuKQ9j3et5yteNr41Y';
  const trialD = 'bnW6NlYWh';
  const trialE = '6OaXFcktTfItzxsorxM6';
  const trialF = 'KWaSLMrwp6XYnrKWrayS';

  // delete classroom with null classroomId
  // delete nonexistant classroom
  // delete classroom under a different teacher
  // delete classroom with users
  // delete classroom successfully
  // delete classroom successfully that has decks

  try {
    await deleteClassroom(trialA, (err) => {
      console.log('Trial A encountered error:');
      console.error(err);
    });
    await deleteClassroom(trialB, (err) => {
      console.log('Trial B encountered error:');
      console.error(err);
    });
    await deleteClassroom(trialC, (err) => {
      console.log('Trial C encountered error:');
      console.error(err);
    });
    await deleteClassroom(trialD, (err) => {
      console.log('Trial D encountered error:');
      console.error(err);
    });
    await deleteClassroom(trialE, (err) => {
      console.log('Trial E encountered error:');
      console.error(err);
    });
    await deleteClassroom(trialE, (err) => {
      console.log('Trial E encountered error:');
      console.error(err);
    });
    await deleteClassroom(trialF, (err) => {
      console.log('Trial F encountered error:');
      console.error(err);
    });

  } catch(e) {
    // Due to the nature of deleteClassroom and deletePeriod, this catch block should never be reached
    console.log('Unreachable catch block triggered -- troubleshoot');
  }

}

// main();