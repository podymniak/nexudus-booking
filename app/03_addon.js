/**
 * This file if for functions triggered by cards
 */

/** Saves booking IDs selected on homepage as new available slots */
// const saveBookings = (e) => {
//     const selectedSlots = e.formInputs.free_slots
//
//     if (!selectedSlots) {
//         return cardWithNotification(e, onHomepage, 'No bookings selected')
//     }
//
//     addToSavedBookedBookings(selectedSlots)
//     removeFromBookedBookings(selectedSlots)
//
//     return cardWithNotification(e, onHomepage, 'Bookings saved and ready to use :)')
// }


/** Books selected room writes extended properties to calendar event and updates available slots */
const bookResource = (e) => {
    try {
        const selectedResource = e.formInput.selected_resource

        if (!selectedResource) {
            return cardWithNotification(e, onCalendarEventOpen, 'No room was selected')
        }

        const [resourceName, resourceId] = selectedResource.split('|;|')

        const event = getCalendarEvent(e.calendar.id)

        const startTime = event.start.dateTime
        const endTime = event.end.dateTime

        let bookingId = readBookingIdPropertiesFromEvent(event) //|| getAvailableBookings()[0]
        let result

        if (bookingId) {
            result = updateBooking(resourceId, startTime, endTime, bookingId)
        } else {
            result = createBooking(resourceId, startTime, endTime)
        }

        if (result.error) {
            return cardWithNotification(e, onCalendarEventOpen, `ERROR: ${result.message}`)
        }

        // TODO find bookingId
        if (!bookingId) {
            bookingId = getNewestBookingId()
        }

        writeExtendedPropertiesToEvent(event, bookingId, resourceId, resourceName, startTime, endTime)
        updateCalendarEvent(event)
        // addToBookedBookings([bookingId])

        // console.log(event.extendedProperties)
        Logger.log({function: 'bookResource', error: result.error, message: result.message, user: USER_EMAIL})
        return cardWithNotification(e, onCalendarEventOpen, `Boom! Your room is booked :)`)
    } catch (err) {
        return cardWithNotification(e, onCalendarEventOpen, err)
    }
}

