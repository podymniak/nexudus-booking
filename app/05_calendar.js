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

const deleteAllExtendedPropertiesFromEvent = (event) => delete event.extendedProperties

const tempEndTime = (startTime) => {
    const date = new Date(startTime)
    date.setHours(date.getHours() + 1)
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss')
}

// const searchAvailabilityByCalendar = (
//   startTime='2024-04-11T09:30:00+02:00',
//   endTime='2024-04-11T10:00:00+02:00'
// ) => {
//   // const events = listCalendarEvents(fixTimezone(startTime), fixTimezone(endTime), LOFTMILL_CALENDAR).items
//   const events = listCalendarEvents(startTime, endTime, LOFTMILL_CALENDAR).items
//
//   const bookedRooms = []
//   for (let i in events) {
//     const resource = events[i].description
//     // console.log(resource)
//     bookedRooms.push(resource)
//   }
//   return bookedRooms
// }

// const findAvailableResources = (
//   startTime='2024-04-11T09:30:00+02:00',
//   endTime='2024-04-11T10:00:00+02:00'
// ) => {
//   const bookedResources = searchAvailabilityByCalendar(startTime, endTime)
//   const allResources = getRooms()
//   // console.log(bookedResources,allResources)
//
//   for (let i in bookedResources) {
//     // console.log(bookedResources[i])
//     delete allResources[bookedResources[i]]
//   }
//
//   // console.log(allResources)
//   return allResources
// }

// const fixTimezone = (date='2024-04-11T10:00:00+02:00') => {
//   /**{ dateTime: '2024-04-11T07:30:00Z',
//   timeZone: 'Europe/Amsterdam' } */
//   const timeZone = 'Europe/Amsterdam'
//   const fixedDate = new Date(date).toLocaleString('en-US', { timeZone: timeZone })
//   return (new Date(fixedDate)).toISOString()
// }

// const listCalendarEvents = (startDate, endDate, calendar=PRIMARY_CALENDAR) => {
//     return Calendar.Events.list(calendar, {
//         timeMin: startDate,
//         timeMax: endDate,
//         singleEvents: true
//     })
// }

// const fixDate = (date) => date.split('+')[0]























