// const REFRESH_TOKEN_NAME = 'REFRESH_TOKEN'
const ACCESS_TOKEN_NAME = 'ACCESS_TOKEN'
const PASSWORD_NAME = 'PASSWORD'

const setPassword = (value) => PropertiesService.getUserProperties().setProperty(PASSWORD_NAME, value)
const getPassword = () => PropertiesService.getUserProperties().getProperty(PASSWORD_NAME)
// const setRefreshToken = (value) => PropertiesService.getUserProperties().setProperty(REFRESH_TOKEN_NAME, value)
// const getRefreshToken = () => PropertiesService.getUserProperties().getProperty(REFRESH_TOKEN_NAME)
const setAccessToken = (value) => PropertiesService.getUserProperties().setProperty(ACCESS_TOKEN_NAME, value)
const getAccessToken = () => PropertiesService.getUserProperties().getProperty(ACCESS_TOKEN_NAME)
const deleteAccessToken = () => PropertiesService.getUserProperties().deleteProperty(ACCESS_TOKEN_NAME)
const deleteUserProps = () => PropertiesService.getUserProperties().deleteAllProperties()


const setPasswordFromInput = (e) => {
    const password = e.formInput.password
    const passwordTest = getToken(password)

    if (!passwordTest.error) {
        setPassword(password)
    }

    return cardWithNotification(e,
        e.calendar.id ? onCalendarEventOpen : passwordTest.error ? noPasswordCard : onHomepageEventOpen,
        passwordTest.error || 'Password set correctly'
    )
}

const test = () => console.log(getToken())

/**
 * Authentification to Nexudus
 * If no access token in user properties - UI prompt for user to provide password TODO hide password from view?
 * If access token in user properties - refresh token
 * return access token (or null if error TODO: function to reset password)
 */
const getToken = (password = getPassword()) => {
    let accessToken = getAccessToken()

    if (accessToken) {
        return accessToken
    }

    try {
        const response = UrlFetchApp.fetch(
            `https://spaces.nexudus.com/api/token`,
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    client_id: USER_EMAIL,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                payload:
                // refreshToken ?
                //   {
                //     grant_type: 'refresh_token',
                //     refresh_token: refreshToken
                //   }
                //   :
                    {
                        grant_type: 'password',
                        username: USER_EMAIL,
                        password: password
                    }
            }
        )

        accessToken = JSON.parse(response.getContentText()).access_token
        setAccessToken(accessToken)
        // console.log(accessToken)
        return accessToken

    } catch (e) {
        // console.log('Input password')
        deleteUserProps()
        // getToken()
        return {error: e}
    }
}


// /**
//  * UI prompt for user to provide password
//  */
// function showPasswordPrompt() {
//   const ui = SpreadsheetApp.getUi()
//
//   const result = ui.prompt(
//       'Password required',
//       `Input Luxoft password for: ${USER_EMAIL}`,
//       ui.ButtonSet.OK_CANCEL);
//
//   const button = result.getSelectedButton()
//   const text = result.getResponseText()
//
//   if (button == ui.Button.OK) {
//     return text
//   } else {
//     return
//   }
// }
