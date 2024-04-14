const saveBookings = (e) => {
  const selectedSlots = e.formInputs.free_slots

  if (!selectedSlots) {
    return cardWithNotification(e, onHomepage, 'No slots were selected')
  }

  // Add to saved bookings
  let savedBookings = getSavedBookings()
  console.log(savedBookings)

  const combinedBookings = savedBookings.concat(selectedSlots)
  const newAvailableBookings = [...new Set(combinedBookings)]
  console.log(newAvailableBookings)

  setSavedBookings(newAvailableBookings)
  removeFromBookedBookings(selectedSlots)

  return cardWithNotification(e, onHomepage, 'Slots saved :)')
}

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

  console.log(event.extendedProperties)
  return cardWithNotification(e, onCalendarEventOpen, `${result.message} :)`)
}

/** Booking properties */
const checkBookingProperties = () => {
  console.log(getSavedBookings())
  console.log(getBookedBookings())
  console.log(getAvailableBookings())
}

const removeFromBookedBookings = (list) => {
  const bookedBookings = getBookedBookings()
  const newBookedBookings = bookedBookings.filter(item => !list.includes(item))
  console.log(bookedBookings)
  console.log(newBookedBookings)
  setBookedBookings(newBookedBookings)
}

const addToBookedBookings = (list) => {
  const bookedBookings = getBookedBookings()
  const combinedBookings = bookedBookings.concat(list)
  const newBookedBookings = [...new Set(combinedBookings)]
  console.log(bookedBookings)
  console.log(newBookedBookings)
  setBookedBookings(newBookedBookings)
}

const updatedBookedBookings = (futureBookings = listMyFutureBookings()) => {
  const futureBookingsIds = Object.keys(futureBookings)
  const bookedBookings = getBookedBookings()
  const pastBookings = bookedBookings.filter(item => !futureBookingsIds.includes(item))
  const newBookedBookings = bookedBookings.filter(item => !pastBookings.includes(item))
  setBookedBookings(newBookedBookings)
}

