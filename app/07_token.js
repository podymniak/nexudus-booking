/**
 * This file is for oAuth access to Nexudus
 */

const setPassword = (value) => PropertiesService.getUserProperties().setProperty(PASSWORD_NAME, value)
const getPassword = () => PropertiesService.getUserProperties().getProperty(PASSWORD_NAME)
const setAccessToken = (value) => PropertiesService.getUserProperties().setProperty(ACCESS_TOKEN_NAME, value)
const getAccessToken = () => PropertiesService.getUserProperties().getProperty(ACCESS_TOKEN_NAME)
const deleteUserProps = () => PropertiesService.getUserProperties().deleteAllProperties()
const deleteAccessToken = () => PropertiesService.getUserProperties().deleteProperty(ACCESS_TOKEN_NAME)
// const setRefreshToken = (value) => PropertiesService.getUserProperties().setProperty(REFRESH_TOKEN_NAME, value)
// const getRefreshToken = () => PropertiesService.getUserProperties().getProperty(REFRESH_TOKEN_NAME)


const setPasswordFromInput = (e) => {
    const password = e.formInput.password
    const passwordTest = getToken(password)

    if (!passwordTest.error) {
        setPassword(password)
    }

    const message = passwordTest.error || 'Password set :)'

    Logger.log({function: 'setPasswordFromInput', error: !!passwordTest.error, message: message, user: USER_EMAIL})
    return cardWithNotification(e,
        e.calendar.id ? onCalendarEventOpen : passwordTest.error ? noPasswordCard : onHomepage,
        message
    )
}

/**
 * Authentification to Nexudus
 * If no access token in user properties - UI prompt for user to provide password TODO hide password from view?
 * If access token in user properties - refresh token
 * return access token (or null if error) TODO: function to reset password (?)
 */
const getToken = (password = getPassword(), attempt = 0) => {
    let accessToken = getAccessToken()

    if (accessToken) {
        // Logger.log('access token exists')
        testToken(accessToken, password)
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
        // Logger.log('new access token generated')
        return accessToken

    } catch (e) {
        // deleteUserProps()
        Logger.log({function: 'getToken', error: true, message: e, user: USER_EMAIL})
        // getToken()
        return {error: e}
    }
}

const testToken = (accessToken, password) => {
    try {
        listBookingsRequest(accessToken)
    } catch (error) {
        Logger.log(`Access error: ${error}`)
        deleteAccessToken()
        getToken(password, 1)
    }
}

