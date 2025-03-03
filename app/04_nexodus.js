/**
 * This file is for working with Nexudus API
 * Public API
 * https://developers.nexudus.com/reference/about-the-public-api
 */

/**
 * Creates an object with user's future bookings
 * https://developers.nexudus.com/reference/delete-bookings-1
 */
function listMyFutureBookings() {
    const accessToken = getToken()

    if (accessToken.error) {
        // console.log(accessToken.error)
        return {error: accessToken.error}
    }

    const response = listBookingsRequest(accessToken)
    const myBookings = JSON.parse(response.getContentText()).MyBookings

    const myFutureBookings = {}
    for (let i in myBookings) {
        const bookingId = myBookings[i].Id

        myFutureBookings[bookingId] = `📅 ${myBookings[i].FromTime.split('T')[0]} 
            🕒 ${myBookings[i].FromTime.split('T')[1].slice(0, 5)}-${myBookings[i].ToTime.split('T')[1].slice(0, 5)} 
            ${myBookings[i].ResourceName}`

        // myFutureBookings[bookingId] = {
        //   room: myBookings[i].ResourceName.split(' ')[0],
        //   startTime: myBookings[i].FromTime,
        //   endTime: myBookings[i].ToTime,
        // }
    }

    // console.log(JSON.stringify(myFutureBookings, " ", 4))
    return myFutureBookings
}

const listBookingsRequest = (accessToken) => {
    return UrlFetchApp.fetch(
        `${API_ENDPOINT}/bookings/my?_depth=3`,
        {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`
            }
        }
    )
}

/**
 * Creates an object with all resources (rooms) in the location
 * Excludes resource IDs defined in EXCLUDED_RESOURCES
 * https://developers.nexudus.com/reference/search-resources
 */
function getRooms() {
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', 'Content-Type': 'application/json'}
    }

    const response = UrlFetchApp.fetch(`${API_ENDPOINT}/bookings/search`, options)
    const resources = JSON.parse(response.getContentText()).Resources

    // console.log(JSON.parse(response.getContentText()))
    let rooms = {}
    for (let room in resources) {
        if (!EXCLUDED_RESOURCES.includes(resources[room].Id)) {
            rooms[resources[room].Name] = resources[room].Id
        }
    }
    // console.log(rooms)
    return rooms
}

/**
 * Books a resource for the given time - creating new bookings is not possible with Public API, so it's only update
 * https://developers.nexudus.com/reference/update-booking-1
 */
const updateBooking = (resource, startTime, endTime, bookingId) => {
    const accessToken = getToken()

    if (accessToken.error) {
        // console.log(accessToken.error)
        return {error: accessToken.error}
    }
    // console.log(resource, startTime, endTime, bookingId)
    // console.log('startTime', startTime, typeof(startTime))

    const response = UrlFetchApp.fetch(
        `${API_ENDPOINT}/bookings/bookingJson`,
        {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`
            },
            payload: JSON.stringify({
                booking: {
                    ResourceId: resource,
                    FromTime: startTime.split('+')[0], // TODO better format fix
                    // ToTime: endTime.split('+')[0],
                    ToTime: endTime,
                    Id: bookingId,
                    resource: {
                        Id: resource
                    }
                }
            })
        })
    // console.log(response.getContentText())
    const result = JSON.parse(response.getContentText())
    //{"Status":200,"Message":"Your booking has been updated","Value":null,"OpenInDialog":false,"OpenInWindow":false,"RedirectURL":null,"JavaScript":null,"UpdatedOn":null,"UpdatedBy":null,"Errors":null,"WasSuccessful":true}
    return {
        error: !result.WasSuccessful,
        message: result.Message
    }
}


/**
 * Public API doesn't give correct availability results (https://developers.nexudus.com/reference/search-resources)
 * But it works with this one: https://developers.nexudus.com/reference/get-booking-calendar
 start: '2024-04-15T12:00:00+02:00',
 end: '2024-04-15T13:00:00+02:00'
 */
const getBookingCalendar = (
    startTime = '2024-04-10T10:30:00+02:00',
    endTime = '2024-04-10T11:00:00+02:00'
) => {
    response = UrlFetchApp.fetch(
        `${API_ENDPOINT}/bookings/fullCalendarBookings`,
        {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            payload: JSON.stringify({
                // TODO better fix for date format
                start: startTime.split('+')[0],
                end: endTime.split('+')[0]
            })
        }
    )

    const bookings = JSON.parse(response.getContentText())
    const resources = getRooms()
    // console.log(resources)

    const eventStartTime = new Date(startTime)
    const eventEndTime = new Date(endTime)
    // console.log(`${eventStartTime}\n${eventEndTime}`)

    const coworkerId = getCoworkerIdProperty()

    for (let i in bookings) {
        const resourceStartTime = fixTimezone(bookings[i].start) // 2024-04-14T22:00Z
        const resourceEndTime = fixTimezone(bookings[i].end)

        // console.log(`${resourceStartTime}\n${resourceEndTime}`)

        if (resourceEndTime > eventStartTime && resourceStartTime < eventEndTime && bookings[i].coworkerId!==coworkerId) {
            // console.log(`${bookings[i].title}, start: ${resourceStartTime}, end: ${resourceEndTime}`, bookings[i].id)
            delete resources[bookings[i].title]
        }
    }
    // console.log(resources)
    return resources
}


const getCoworkerId = () => {
      const accessToken = getToken()

    if (accessToken.error) {
        return {error: accessToken.error}
    }

      response = UrlFetchApp.fetch(
        `${API_ENDPOINT}/profile?_resource=Coworker`,
        {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`
            }
        }
    )

    const coworker = JSON.parse(response.getContentText())
    // console.log(coworker.Id)
    return coworker.Id
}


/**
 * Nexudus saves events in local time - eg '2024-04-14T22:00Z' - but for Google Calendar this looks like GMT
 * 2 hours are forcibly and stupidly subtracted ;((((((((((
 * TODO make it not stupid
 * help..
 */
const fixTimezone = (date = '2024-04-14T22:00Z') => {
    const dateFormat = new Date(date)
    dateFormat.setHours(dateFormat.getHours() - 2) // will work only for GMT+2
    // console.log(dateFormat)
    return dateFormat
}


// /**
//  * Nexudus Marketplase API doesn't give correct availability results
//  * https://developers.nexudus.com/reference/search-resources
//   start: '2024-04-15T12:00:00+02:00',
//   end: '2024-04-15T13:00:00+02:00'
//  */
// const searchAvailableResources = (
//   startTime='2024-04-18T12:30:00+02:00', 
//   endTime='2024-04-18T13:00:00+02:00'
//   ) => {
//   response = UrlFetchApp.fetch(
//     `${API_ENDPOINT}/bookings/search`,
//     {
//       method: 'GET',
//       headers: {
//         accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       payload: JSON.stringify({
//         start: startTime.split('+')[0],
//         end: endTime.split('+')[0]
//       })
//     }
//   )

//   const resources = JSON.parse(response.getContentText()).Resources

//   const availableResources = {}
//   for (let i in resources) {
//     console.log(resources[i].ErrorCode)
//     const resourceId = resources[i].Id
//     if (!resources[i].ErrorCode) {
//       availableResources[resourceId] = resources[i].Name //.split(' ')[0]
//     }
//   }
//   console.log(availableResources)
//   return availableResources
// }



