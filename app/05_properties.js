/**
 * This file is for working with script / user properties
 * Access-related properties are in 06_token.js
 */

/** Coworker ID */
const setCoworkerIdProperty = () => {
    const api = new Book()
    const userId = api.getUserId().Id
    if (!userId.error) {
        PropertiesService.getUserProperties().setProperty(COWORKER_ID_NAME, userId)
        PropertiesService.getUserProperties().setProperty(COWORKER_ID_NAME, userId)
    }
    return userId
}
const getCoworkerIdProperty = () => {
      const id = PropertiesService.getUserProperties().getProperty(COWORKER_ID_NAME)
      return id ? id : setCoworkerIdProperty()
  }

