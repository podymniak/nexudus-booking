/**
 * That file contains actions related to Nexudus API
 * Public API
 * https://developers.nexudus.com/reference/about-the-public-api
 */

class Book {
    constructor(token) {
        this.token = token || getToken()
    }

    createBooking(resource, startTime, endTime) {
        /**
         * Creates a room booking
         * https://developers.nexudus.com/reference/check-out
         * no return message from the correct request
         */
        return this.genericRequest(
            'POST',
            `${API_ENDPOINT}/basket/CreateInvoice`,
            {
                "basket": [{
                    "Type": "booking",
                    "Booking": {
                        "FromTime": startTime.split('+')[0],
                        "ToTime": endTime.split('+')[0],
                        "ResourceId": resource
                    }
                }], "discountCode": null
            }
        )
    }

    updateBooking(bookingId, resource, startTime, endTime) {
        /**
         * Updates rooms booking
         * https://developers.nexudus.com/reference/update-booking-1
         */
        return this.genericRequest(
            'POST',
            `${API_ENDPOINT}/bookings/bookingJson`,
            {
                booking: {
                    ResourceId: resource,
                    FromTime: startTime.split('+')[0], // TODO better format fix
                    ToTime: endTime.split('+')[0],
                    // ToTime: endTime,
                    Id: bookingId,
                    resource: {
                        Id: resource
                    }
                }
            }
        )
    }

    deleteBooking(bookingId) {
        /**
         * Deletes a room booking
         * https://developers.nexudus.com/reference/delete-bookings
         */
        return this.genericRequest(
            'POST',
            `${API_ENDPOINT}/bookings/deletejson/${bookingId}`,
            null
        )
    }

    getBookingCalendar(startTime, endTime) {
        /**
         * Returns booked resources within given time period
         * Used to find available resources as the dedicated method (https://developers.nexudus.com/reference/search-resources) doesn't work
         * https://developers.nexudus.com/reference/get-booking-calendar
         start: '2024-04-15T12:00:00+02:00',
         end: '2024-04-15T13:00:00+02:00'
         */
        return this.genericRequest(
            'GET',
            `${API_ENDPOINT}/bookings/fullCalendarBookings`,
            {
                // TODO better fix for date format
                start: startTime.split('+')[0],
                end: endTime.split('+')[0]
            },
            false
        )
    }


    getAllResources() {
        /**
         * Retrieves all resources (rooms) in the location
         * https://developers.nexudus.com/reference/search-resources
         */
        return this.genericRequest(
            'GET',
            `${API_ENDPOINT}/bookings/search`,
            null,
            false
        )
    }

    getUserFutureBookings() {
        /**
         * Retrieves user's future bookings
         * https://developers.nexudus.com/reference/delete-bookings-1
         * yes, this url is correct
         */
        return this.genericRequest(
            'POST',
            `${API_ENDPOINT}/bookings/my?_depth=3`,
            null
        )
    }


    getUserId() {
        /**
         * Finds ID of the current user
         * Used to filter owned bookings
         * https://developers.nexudus.com/reference/get-customer-profile
         */
        return this.genericRequest(
            'GET',
            `${API_ENDPOINT}/profile?_resource=Coworker`,
            null,
        )
    }


    genericRequest(method, url, payload, include_token=true) {
        try {
            const options = {
                method: method,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }

            if (payload !== null) {
                options.payload = JSON.stringify(payload)
            }

            if (include_token) {
                options.headers.authorization = `Bearer ${this.token}`
                if (this.token.error) {
                    return {error: this.token.error}
                }
            }

            const response =  UrlFetchApp.fetch(url, options)

            const result = response.getContentText() ? JSON.parse(response.getContentText()) : {Message:"yess", WasSuccessful:true}
            result.error = !result.WasSuccessful

            return result

        } catch (error) {
            return {error: error.message}
        }
    }
}