/**
 * This file is for working with script / user properties
 * Access-related properties are in token.js
 */
const setSavedBookings = (list) => PropertiesService.getUserProperties().setProperty(SAVED_BOOKINGS_NAME, list.join(','))
const setBookedBookings = (list) => PropertiesService.getUserProperties().setProperty(BOOKED_BOOKINGS_NAME, list.join(','))
const getSavedBookings = () => stringToList(PropertiesService.getUserProperties().getProperty(SAVED_BOOKINGS_NAME))
const getBookedBookings = () => stringToList(PropertiesService.getUserProperties().getProperty(BOOKED_BOOKINGS_NAME))
const getAvailableBookings = () => getSavedBookings().filter(item => !getBookedBookings().includes(item))
// const deleteBookingsProp = () => PropertiesService.getUserProperties().deleteProperty(BOOKINGS_NAME)


/** Booking properties */
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

const updatedBookedBookings = (futureBookings) => {
    const futureBookingsIds = Object.keys(futureBookings)
    const bookedBookings = getBookedBookings()
    const pastBookings = bookedBookings.filter(item => !futureBookingsIds.includes(item))
    const newBookedBookings = bookedBookings.filter(item => !pastBookings.includes(item))
    setBookedBookings(newBookedBookings)
}

const addToSavedBookedBookings = (list) => {
    const savedBookings = getSavedBookings()
    const combinedBookings = savedBookings.concat(list)
    const newAvailableBookings = [...new Set(combinedBookings)]
    setSavedBookings(newAvailableBookings)
}

// This one is just for testing
const checkBookingProperties = () => {
    console.log(getSavedBookings())
    console.log(getBookedBookings())
    console.log(getAvailableBookings())
}

/** Helpers */
const stringToList = (string) => {
    if (!string) {
        return []
    } else if (string.endsWith(',')) {
        string = string.slice(0, -1)
    }
    return string ? string.split(',') : []
}



