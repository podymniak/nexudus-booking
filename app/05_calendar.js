/**
 * This file is for working with Google Calendar
 */

/** Calendar functions */
const getCalendarEvent = (eventId) => Calendar.Events.get(PRIMARY_CALENDAR, eventId)
const updateCalendarEvent = (event) => Calendar.Events.update(event, PRIMARY_CALENDAR, event.id)

/** Read event properties */
const readBookingIdPropertiesFromEvent = (event) => event.extendedProperties?.private?.bookingId

const readExtendedPropertiesFromEvent = (event) => {
    const extProps = event.extendedProperties
    return {
        bookingId: extProps?.private?.bookingId || extProps?.shared?.bookingId,
        resourceId: extProps?.private?.resourceId || extProps?.shared?.resourceId,
        resourceName: extProps?.private?.resourceName || extProps?.shared?.resourceName,
        startTime: extProps?.private?.startTime || extProps?.shared?.startTime,
        endTime: extProps?.private?.endTime || extProps?.shared?.endTime,
    }
}

/** Write event properties */
const writeExtendedPropertiesToEvent = (event, bookingId, resourceId, resourceName, startTime, endTime) => {
    if (!event.extendedProperties) {
        event.extendedProperties = {}
    }

    if (!event.extendedProperties.private) {
        event.extendedProperties.private = {}
    }

    // Private properties
    event.extendedProperties.private.bookingId = bookingId
    event.extendedProperties.private.resourceId = resourceId
    event.extendedProperties.private.resourceName = resourceName
    event.extendedProperties.private.startTime = startTime
    event.extendedProperties.private.endTime = endTime

    // Shared properties
    if (event.organizer?.self) {
        event.extendedProperties.shared = {
            bookingId: bookingId,
            resourceId: resourceId,
            resourceName: resourceName,
            startTime: startTime,
            endTime: endTime
        }
    }

    return event
}

