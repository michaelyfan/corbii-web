export function shiftInArray(array, oldIndex, newIndex) {
  if (newIndex >= array.length) {
    newIndex = array.length - 1;
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
}

/*
 * Gets the UNIX epoch time of a specified number of hours before the current time.
 *
 * @param {number} hours -- the number of hours before now to get the UNIX epoch time of
 *
 * @return the UNIX epoch time of a specified number of hours before the current time
 *
 */
export function getHoursBeforeNow(hours) {
  if (hours === 0) {
    return getNow();
  } else {
    return Math.round((Date.now() / 1000) - (hours * 60 * 60));
  }
}

/*
 * Gets the UNIX epoch time of the current time.
 *
 * @return the UNIX epoch time of the current time
 */
export function getNow() {
  return Math.round(Date.now() / 1000);
}

/*
 * Evaluates if two arrays are equal, value-by-value
 */
export function arraysAreSame(a1, a2) {
  if (a1 == null && a2 == null) {
    return true;
  } else if (a1 == null) {
    return false;
  } else if (a2 == null) {
    return false;
  } else { // both arrays are non-null
    for (let i = 0; i < a1.length; i++) {
      if (a1[i] != a2[i]) {
        return false;
      }
    }
    return true;
  }
}