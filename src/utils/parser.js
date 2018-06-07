
var parserFuncs = {
  parseAuth(data) {
    return {
      name: data.user.displayName,
      email: data.user.email,
      pic: data.user.photoURL,
      uid: data.user.uid,
      isNewUser: data.additionalUserInfo.isNewUser
    }
  },

  parseFirebaseUser({displayName, email, photoURL, uid}) {
    return {
      name: displayName,
      email: email,
      pic: photoURL,
      uid: uid
    }
  }
}

export default parserFuncs;