
export function smAlgorithm(oldEasinessFactor, oldInterval, quality) {

  let newEasinessFactor = oldEasinessFactor - 0.8 + (0.28 * quality) - (0.2 * Math.pow(quality, 2));
  if (newEasinessFactor < 1.3) {
    newEasinessFactor = 1.3;
  }

  let newInterval;
  if (oldInterval <= 0) {
    newInterval = 1;
  } else if (oldInterval == 1) {
    newInterval =  3;
  } else {
    newInterval = Math.floor(oldInterval * newEasinessFactor);
  }

  return [ newEasinessFactor, newInterval ];
}