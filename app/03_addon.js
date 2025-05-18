/**
 * This file if for functions triggered by cards
 */

/** Books selected room and writes extended properties to calendar event */
const createBookingAction = (e) => {
    try {
        const selectedResource = e.formInput.selected_resource

        if (!selectedResource) {
            return cardWithNotification(e, onCalendarEventOpen, 'No room was selected')
        }

        const [resourceName, resourceId] = selectedResource.split('|;|')

        const event = getCalendarEvent(e.calendar.id)

        const startTime = event.start.dateTime
        const endTime = event.end.dateTime

        let bookingId = readBookingIdPropertiesFromEvent(event)

        const api = new Book()

        const result = bookingId ?
            api.updateBooking(bookingId, resourceId, startTime, endTime) :
            api.createBooking(resourceId, startTime, endTime)


        if (result.error) {
            return cardWithNotification(e, onCalendarEventOpen, `ERROR: ${result.message}`)
        }

        if (!bookingId) {
            /**
             * Create booking requests returns no values when successful
             * Booking ID is retried by checking for the newest booking
             * TODO find bookingId
             */
            bookingId = String(api.getUserFutureBookings().MyBookings[0].Id)
        }

        writeExtendedPropertiesToEvent(event, bookingId, resourceId, resourceName, startTime, endTime)
        updateCalendarEvent(event)

        // console.log(event.extendedProperties)
        Logger.log({function: 'bookResource', error: result.error, message: result.message, user: USER_EMAIL})
        return cardWithNotification(e, onCalendarEventOpen, `Boom! Your room is booked :)`)
    } catch (err) {
        return cardWithNotification(e, onCalendarEventOpen, err)
    }
}


/** Deleted room booking and clears extended calendar event properties */
const deleteBookingAction = (e) => {
    const event = getCalendarEvent(e.calendar.id)
    const bookingId = readBookingIdPropertiesFromEvent(event)
    console.log('bookingId',bookingId)

    const api = new Book()
    const result = api.deleteBooking(bookingId)

    if (result.error) {
        return cardWithNotification(e, onCalendarEventOpen, `ERROR: ${result.message}`)
    }

    event.extendedProperties = {}
    updateCalendarEvent(event)

    return cardWithNotification(e, onCalendarEventOpen, 'Booking deleted')
}

/**
 * Creates an object with user's future bookings
 */
function listMyFutureBookings() {
    const api = new Book()
    const myBookings = api.getUserFutureBookings().MyBookings
    // const myBookings = api.getUserFutureBookings().MyBookings[0].Id

    const myFutureBookings = {}
    for (let i in myBookings) {
        const bookingId = myBookings[i].Id

        myFutureBookings[bookingId] = `📅 ${myBookings[i].FromTime.split('T')[0]} 
            🕒 ${myBookings[i].FromTime.split('T')[1].slice(0, 5)}-${myBookings[i].ToTime.split('T')[1].slice(0, 5)} 
            ${myBookings[i].ResourceName}`
    }

    // console.log(JSON.stringify(myFutureBookings, " ", 4))
    return myFutureBookings
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
    const api = new Book ()

    const bookings = api.getBookingCalendar(startTime, endTime)
    const resources = getRooms(api)

    const eventStartTime = new Date(startTime)
    const eventEndTime = new Date(endTime)
    // console.log(`${eventStartTime}\n${eventEndTime}`)

    const coworkerId = getCoworkerIdProperty()

    for (let i in bookings) {
        const resourceStartTime = fixTimezone(bookings[i].start) // 2024-04-14T22:00Z
        const resourceEndTime = fixTimezone(bookings[i].end)

        // console.log(`${resourceStartTime}\n${resourceEndTime}`)

        if (resourceEndTime > eventStartTime && resourceStartTime < eventEndTime && bookings[i].coworkerId !== coworkerId) {
            // console.log(`${bookings[i].title}, start: ${resourceStartTime}, end: ${resourceEndTime}`, bookings[i].id)
            delete resources[bookings[i].title]
        }
    }
    // console.log(resources)
    return resources
}


/**
 * Creates an object with all resources (rooms) in the location
 * Excludes resource IDs defined in EXCLUDED_RESOURCES
 * https://developers.nexudus.com/reference/search-resources
 */
function getRooms(api) {
    const response = api.getAllResources()
    const resources = response.Resources

    let rooms = {}
    for (let room in resources) {
        if (!EXCLUDED_RESOURCES.includes(resources[room].Id)) {
            rooms[resources[room].Name] = resources[room].Id
        }
    }

    return rooms
}



/**
 * Nexudus saves events in local time - eg '2024-04-14T22:00Z' - but for Google Calendar this looks like GMT
 * 2 hours are subtracted
 * TODO fix timezone issue
 */
const fixTimezone = (date = '2024-04-14T22:00Z') => {
    const dateFormat = new Date(date)
    dateFormat.setHours(dateFormat.getHours() - 2) // will work only for GMT+2
    // console.log(dateFormat)
    return dateFormat
}


