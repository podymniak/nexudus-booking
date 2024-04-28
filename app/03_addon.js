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

    const result = updateBooking(resourceId, event.start.dateTime, event.end.dateTime, bookingId)

    if (result.error) {
        return cardWithNotification(e, onCalendarEventOpen, `ERROR: ${result.message}`)
    }

    writeExtendedPropertiesToEvent(event, bookingId, resourceId, resourceName, event.start.dateTime, event.end.dateTime)
    updateCalendarEvent(event)
    addToBookedBookings([bookingId])

    // console.log(event.extendedProperties)
    Logger.log({function: 'bookResource', error: result.error, message: result.message, user: USER_EMAIL})
    return cardWithNotification(e, onCalendarEventOpen, `Room has been booked :)`)
}

