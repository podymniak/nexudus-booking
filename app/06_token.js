/**
 * This file is for oAuth access to Nexudus
 */

const setPassword = (value) => PropertiesService.getUserProperties().setProperty(PASSWORD_NAME, value)
const getPassword = () => PropertiesService.getUserProperties().getProperty(PASSWORD_NAME)
const setAccessToken = (value) => PropertiesService.getUserProperties().setProperty(ACCESS_TOKEN_NAME, value)
const getAccessToken = () => PropertiesService.getUserProperties().getProperty(ACCESS_TOKEN_NAME)
// const deleteUserProps = () => PropertiesService.getUserProperties().deleteAllProperties()
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
    // console.log(accessToken)
    // console.log(USER_EMAIL)

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
        // console.log(accessToken)
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
        UrlFetchApp.fetch(
            `${API_ENDPOINT}/user/me`,
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${accessToken}`
                }
            })
        // Logger.log(`Test: ${response.getContentText()}`)
    } catch (error) {
        Logger.log(`Access error: ${error}`)
        deleteAccessToken()
        getToken(password, 1)
    }
}


function webTest() {
  const password = getPassword()
  
  const response = UrlFetchApp.fetch("https://warszawalixa.spaces.nexudus.com/api/token", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "client_id": "nexudus.portal.marta.podymniak@delvedeeper.com",
    "content-type": "application/x-www-form-urlencoded",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://warszawalixa.spaces.nexudus.com/login",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": `grant_type=password&username=marta.podymniak%40delvedeeper.com&password=${password}&totp=`,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});

  console.log(response.getResponseCode());
  console.log(response.getContentText());
}

const webTestic = () => {
  const response = UrlFetchApp.fetch("https://warszawalixa.spaces.nexudus.com/api/token", {
    "headers": {
      "accept": "application/json",
      "client_id": "nexudus.portal.maksim.arol@delvedeeper.com",
      "content-type": "application/x-www-form-urlencoded",
    },
    // "body": {"grant_type": "password", "username": "maksim.arol@delvedeeper.com", "password": "123Palka!"},
    "body": {"grant_type": "refresh_token", "refresh_token": "54e0544dd0ed4c2bb0934b3c44fee5fe"},
    "method": "POST"
  });

  console.log(response.getResponseCode());
  console.log(response.getContentText());
}
