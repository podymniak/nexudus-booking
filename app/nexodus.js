const MAX_SLOTS = 5
const EXCLUDED_RESOURCES = [1415077508]


function listMyFutureBookings() {
  const accessToken = getToken()

  if (accessToken.error) {
    console.log(accessToken.error)
    return {error: accessToken.error}
  }

  const response = UrlFetchApp.fetch(
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
  const myBookings = JSON.parse(response.getContentText()).MyBookings

  const myFutureBookings = {}
  for (let i in myBookings) {
    const bookingId = myBookings[i].Id

    myFutureBookings[bookingId] = {
      room: myBookings[i].ResourceName.split(' ')[0],
      startTime: myBookings[i].FromTime,
      endTime: myBookings[i].ToTime,
    }
  }

  // console.log(JSON.stringify(myFutureBookings, " ", 4))
  return myFutureBookings
}


function getRooms() {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', 'Content-Type': 'application/json'}
  }

  const response = UrlFetchApp.fetch(`${API_ENDPOINT}/bookings/search`, options)
  const resources = JSON.parse(response.getContentText()).Resources

  // console.log(JSON.parse(response.getContentText()))
  let rooms = {}
  for (room in resources) {
    if (!EXCLUDED_RESOURCES.includes(resources[room].Id)) {
      rooms[resources[room].Name] = resources[room].Id
    }
  }
  // console.log(rooms)
  return rooms
}


const updateBooking = (resource, startTime, endTime, bookingId) => {
  // console.log(resource, startTime, endTime, bookingId)

  const response = UrlFetchApp.fetch(
  `${API_ENDPOINT}/bookings/bookingJson`, 
  {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer ${getToken()}`
    },
    payload: JSON.stringify({
      booking: {
          ResourceId: resource,
          FromTime: startTime.split('+')[0],
          ToTime: endTime.split('+')[0],
          Id: bookingId,
          resource: {
            Id: resource
          }
        }
    })
  })
  console.log(response.getContentText())
  const result = JSON.parse(response.getContentText())
  //{"Status":200,"Message":"Your booking has been updated","Value":null,"OpenInDialog":false,"OpenInWindow":false,"RedirectURL":null,"JavaScript":null,"UpdatedOn":null,"UpdatedBy":null,"Errors":null,"WasSuccessful":true}
  return {
    error: !result.WasSuccessful,
    message: result.Message
  }
}


const getBookingCalendar = (
    startTime='2024-04-15T12:30:00+02:00', 
    endTime='2024-04-15T13:00:00+02:00'
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

    const resources = JSON.parse(response.getContentText())
    for (let i in resources) {
      console.log(`${resources[i].title}, start: ${resources[i].start}, end: ${resources[i].end}`, resources[i].id)
    }
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
//         // TODO better fix for date format
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



