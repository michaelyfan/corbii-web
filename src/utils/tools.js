export function generateUIUD() {
  
}

export function shiftInArray(array, oldIndex, newIndex) {
  if (newIndex >= array.length) {
      newIndex = array.length - 1;
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
}