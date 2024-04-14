/**
 * Script assumes that Google Calendar event description for Nexudus bookings is the same as resource name in the API
 * This has to be done that way, as Nexudus Marketplase API doesn't give correct availability results
 * https://developers.nexudus.com/reference/search-resources
 */

const USER_EMAIL = Session.getEffectiveUser().getEmail()
const PRIMARY_CALENDAR = 'primary'
const LOFTMILL_CALENDAR = 'ebk29593r3l71jd4l21r7n83qs3i3bof@import.calendar.google.com' // TODO make calendar flexible (add to props) & change name

/** Booking properties */
const SAVED_BOOKINGS_NAME = 'SAVED_BOOKINGS'
const BOOKED_BOOKINGS_NAME = 'BOOKED_BOOKINGS'

const setSavedBookings = (list) => PropertiesService.getUserProperties().setProperty(SAVED_BOOKINGS_NAME, list.join(','))
const setBookedBookings = (list) => PropertiesService.getUserProperties().setProperty(BOOKED_BOOKINGS_NAME, list.join(','))
const getSavedBookings = () => stringToList(PropertiesService.getUserProperties().getProperty(SAVED_BOOKINGS_NAME))
const getBookedBookings = () => stringToList(PropertiesService.getUserProperties().getProperty(BOOKED_BOOKINGS_NAME))
const getAvailableBookings = () => getSavedBookings().filter(item => !getBookedBookings().includes(item))

const stringToList = (string) => {
  if (!string) {
    return []
  } else if (string.endsWith(',')) {
    string = string.slice(0, -1)
  }
  return string ? string.split(',') : []
}

// const deleteBookingsProp = () => PropertiesService.getUserProperties().deleteProperty(BOOKINGS_NAME)

// const getAvailableBookings = () => {
//   const futureBookings = Object.keys(listMyFutureBookings())
//   const savedBookings = getSavedBookings()
//   // console.log(savedBookings, futureBookings)
//   // console.log(savedBookings.filter(item => !futureBookings.includes(item)))
//   return savedBookings.filter(item => !futureBookings.includes(item))
// }

/** Calendar functions */
const getCalendarEvent = (eventId) => Calendar.Events.get(PRIMARY_CALENDAR, eventId)
const updateCalendarEvent = (event) => Calendar.Events.update(event, PRIMARY_CALENDAR, event.id)

const searchAvailabilityByCalendar = (
  startTime='2024-04-11T09:30:00+02:00',
  endTime='2024-04-11T10:00:00+02:00'
) => {
  // const events = listCalendarEvents(fixTimezone(startTime), fixTimezone(endTime), LOFTMILL_CALENDAR).items
  const events = listCalendarEvents(startTime, endTime, LOFTMILL_CALENDAR).items

  const bookedRooms = []
  for (let i in events) {
    const resource = events[i].description
    // console.log(resource)
    bookedRooms.push(resource)
  }
  return bookedRooms
}

const findAvailableResources = (
  startTime='2024-04-11T09:30:00+02:00',
  endTime='2024-04-11T10:00:00+02:00'
) => {
  const bookedResources = searchAvailabilityByCalendar(startTime, endTime)
  const allResources = getRooms()
  // console.log(bookedResources,allResources)

  for (let i in bookedResources) {
    // console.log(bookedResources[i])
    delete allResources[bookedResources[i]]
  }

  // console.log(allResources)
  return allResources
}

// const fixTimezone = (date='2024-04-11T10:00:00+02:00') => {
//   /**{ dateTime: '2024-04-11T07:30:00Z',
//   timeZone: 'Europe/Amsterdam' } */
//   const timeZone = 'Europe/Amsterdam'
//   const fixedDate = new Date(date).toLocaleString('en-US', { timeZone: timeZone })
//   return (new Date(fixedDate)).toISOString()
// }

const listCalendarEvents = (startDate, endDate, calendar=PRIMARY_CALENDAR) => {
    return Calendar.Events.list(calendar, {
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true
    })
}

// TODO better fix for date format
const fixDate = (date) => date.split('+')[0]


/** Read extended properties */
const readBookingIdPropertiesFromEvent = (event) => event.extendedProperties?.private?.bookingId

const readExtendedPropertiesFromEvent = (event) => {
    const extProps = event.extendedProperties
    return {
        resourceId: extProps?.private?.resourceId || extProps?.shared?.resourceId,
        resourceName: extProps?.private?.resourceName || extProps?.shared?.resourceName,
        startTime: extProps?.private?.startTime || extProps?.shared?.startTime,
        endTime: extProps?.private?.endTime || extProps?.shared?.endTime,
    }
}


/** Write extended properties */
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




















