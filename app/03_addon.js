/**
 * This file if for functions triggered by cards
 */

/** Saves booking IDs selected on homepage as new available slots */
const saveBookings = (e) => {
    const selectedSlots = e.formInputs.free_slots

    if (!selectedSlots) {
        return cardWithNotification(e, onHomepage, 'No bookings were selected')
    }

    addToSavedBookedBookings(selectedSlots)
    removeFromBookedBookings(selectedSlots)

    return cardWithNotification(e, onHomepage, 'Bookings saved and ready to use :)')
}


/** Books selected room writes extended properties to calendar event and updates available slots */
const bookResource = (e) => {
    const selectedResource = e.formInput.selected_resource

    if (!selectedResource) {
        return cardWithNotification(e, onCalendarEventOpen, 'No room was selected')
    }

    const [resourceName, resourceId] = selectedResource.split('|;|')

    const event = getCalendarEvent(e.calendar.id)
    const bookingId = readBookingIdPropertiesFromEvent(event) || getAvailableBookings()[0]

    // TODO FIX END DATE
    const startTime = event.start.dateTime
    // const endTime = event.end.dateTime
    const date = new Date(startTime)
    date.setHours(date.getHours() + 1)
    const endTime = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss')


    const result = updateBooking(resourceId, startTime, endTime, bookingId)

    if (result.error) {
        return cardWithNotification(e, onCalendarEventOpen, `ERROR: ${result.message}`)
    }

    writeExtendedPropertiesToEvent(event, bookingId, resourceId, resourceName, startTime, endTime)
    updateCalendarEvent(event)
    addToBookedBookings([bookingId])

    // console.log(event.extendedProperties)
    Logger.log({function: 'bookResource', error: result.error, message: result.message, user: USER_EMAIL})
    return cardWithNotification(e, onCalendarEventOpen, `Boom! Your room is booked :)`)
}

