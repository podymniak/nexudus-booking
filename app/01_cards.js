/** START */
const onHomepage = (e) => {
    if (getPassword()) {
        return homePageCard(e)
    }
    return noPasswordCard(e)
}

const onCalendarEventOpen = e => {
    if (getPassword()) {
        const event = CalendarApp.getCalendarById(PRIMARY_CALENDAR).getEventById(e.calendar.id)
        return eventCard(event ? getCalendarEvent(e.calendar.id) : null)
    }
    return noPasswordCard(e)
}


/**
 * HOMEPAGE CARD
 * @param e
 * @returns {GoogleAppsScript.Card_Service.ActionResponse|GoogleAppsScript.Card_Service.Card}
 */
const homePageCard = e => {
    const myFutureBookings = listMyFutureBookings()
    if (myFutureBookings.error) { //TODO
        return cardWithNotification(e, noPasswordCard, myFutureBookings.error)
    }
    updatedBookedBookings(myFutureBookings)

    const section = CardService.newCardSection()
        .addWidget(availableBookingsWidget())

    if (myFutureBookings.length === 0) {
        section.addWidget(CardService.newTextParagraph().setText('No future bookings'))
    } else {
        const myFutureBookingsWidget = CardService.newSelectionInput()
            .setFieldName('free_slots')
            .setTitle('Future bookings:')
            .setType(CardService.SelectionInputType.CHECK_BOX)

        const myFutureBookingsList = []
        for (let bookingId in myFutureBookings) {
            myFutureBookingsList.push([myFutureBookings[bookingId], bookingId])
        }
        myFutureBookingsList.sort()

        for (let i in myFutureBookingsList) {
            myFutureBookingsWidget
                .addItem(myFutureBookingsList[i][0], myFutureBookingsList[i][1], false)
        }

        const addSlotsButton = CardService.newTextButton()
            .setText('Make into usable slots')
            // .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(
                CardService.newAction().setFunctionName('saveBookings')
            )

        section.addWidget(myFutureBookingsWidget)
        section.addWidget(addSlotsButton)
    }

    const explanation = CardService.newTextParagraph().setText(
        `▶️ Public API doesn't allow creating<br>new bookings, so we need to use<br>existing ones. 
      <b>1.</b> Create dummy bookings in <a href=${NEXUDUS_CALENDAR}>Nexudus</a> (outside of working hours). Up to ${MAX_SLOTS}<br>slots are available.
      <b>2.</b> Refresh addon, choose your dummy bookings and press the button.<br>
      ☑️ Now you can book rooms from<br>your calendar! Your slots will reset<br>after each meeting, so no need to<br>repeat these steps.`
    )

    section.addWidget(explanation)
    section.addWidget(mapButton())

    return CardService.newCardBuilder()
        .setHeader(getHeader())
        .setFixedFooter(getFooter())
        .addSection(section)
        .build()
}


/**
 * EVENT CARD
 * @param event
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
const eventCard = (event) => {
    const card = CardService.newCardBuilder()
        .setHeader(getHeader())
        .setFixedFooter(getFooter())

    /** Existing event (excludes all day events (TODO exclude OOO)) */
    if (event?.start?.dateTime) {
        // console.log(event)
        const eventProps = readExtendedPropertiesFromEvent(event)
        card.addSection(bookingStatusSection(eventProps))
        card.addSection(availableResourcesSection(event))
        return card.build()
    }

    /** Unrecognized event */
    card.addSection(CardService.newCardSection().addWidget(
            CardService.newTextParagraph().setText('This event must be saved to your calendar before you can book a room.')
        )
    )

    return card.build()
}


/** SECTIONS */
const availableBookingsWidget = () => {
    const availableBookings = getAvailableBookings().length
    return CardService.newTextParagraph().setText(
        `<b>Available slots:</b> ${availableBookings < MAX_SLOTS ? availableBookings : MAX_SLOTS} (max ${MAX_SLOTS})`
    )
}

const mapButton = () => CardService.newTextButton()
    .setText('Office map')
    .setOpenLink(CardService.newOpenLink()
        .setUrl(OFFICE_MAP)
        .setOpenAs(CardService.OpenAs.OVERLAY))


const bookingStatusSection = (eventProps) => {
    const section = CardService.newCardSection().setHeader('Booking Status')

    if (!eventProps.resourceId) {
        return section.addWidget(CardService.newTextParagraph().setText(`No room booked.`))
    }

    return section
        .addWidget(CardService.newTextParagraph()
            .setText(`<b>${eventProps.resourceName}</b>
      ${eventProps.startTime.replace("T", " at ").split('+')[0]} - start
      ${eventProps.endTime.replace("T", " at ").split('+')[0]} - end
      `))
        .addWidget(CardService.newTextButton()
            .setText('See my bookings')
            .setOpenLink(CardService.newOpenLink()
                // .setUrl(`${NEXUDUS_LOCAL_WEBSITE}/profile/bookings?booking_id=${eventProps.bookingId}`))) // nie robotaje ;(
                .setUrl(`${NEXUDUS_LOCAL_WEBSITE}/profile/bookings`)))
}

const availableResourcesSection = (event) => {
    const section = CardService.newCardSection().addWidget(availableBookingsWidget())

    if (getAvailableBookings().length === 0) {
        return section
    }

    // const availableResources = searchAvailableResources(event.start.dateTime, event.end.dateTime)
    // const availableResources = findAvailableResources(event.start.dateTime, event.end.dateTime)
    const availableResources = getBookingCalendar(event.start.dateTime, event.end.dateTime)

    if (availableResources.length === 0) {
        return section.addWidget(CardService.newTextParagraph().setText('No available rooms on that time'))
    }

    const availableResourcesWidget = CardService.newSelectionInput()
        .setFieldName('selected_resource')
        .setTitle('Free rooms:')
        .setType(CardService.SelectionInputType.RADIO_BUTTON)

    for (let resourceName in availableResources) {
        // console.log(resourceNmae)
        availableResourcesWidget
            .addItem(resourceName, `${resourceName}|;|${availableResources[resourceName].toString()}`, false)
    }

    const bookButton = CardService.newTextButton()
        .setText('Book a room')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(
            CardService.newAction().setFunctionName('bookResource')
        )

    return section
        .addWidget(availableResourcesWidget)
        .addWidget(bookButton)
        .addWidget(mapButton())
}


/** NO PASSWORD CARD */
const noPasswordCard = e => {
    return CardService.newCardBuilder()
        .setHeader(getHeader())
        .addSection(
            CardService.newCardSection().addWidget(
                CardService.newTextInput()
                    .setFieldName('password')
                    .setTitle('Password to your Nexudus account:')
                    .setHint('WARNING! YOUR PASSWORD WILL BE VISIBLE WHEN TYPING')
                    .setOnChangeAction(CardService.newAction()
                        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                        .setFunctionName('setPasswordFromInput')
                    ))).build()
}


/** COMMON */
const getHeader = (
    subtitle = 'Brought to you by Marta 🌷',
    title = 'The power of Convenience',
    icon = 'https://github.com/podymniak/podymniak.github.io/blob/main/images/_teaBreakColor.png?raw=true'
) => CardService.newCardHeader()
    .setTitle(title)
    .setSubtitle(subtitle)
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl(icon)

const getFooter = () => CardService.newFixedFooter()
    .setPrimaryButton(
        CardService.newTextButton()
            // .setText('SHARE THE LOVE')
            .setText('SHARE')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOpenLink(CardService.newOpenLink().setUrl(PRIMARY_BUTTON_LINK))
    )
    .setSecondaryButton(
        CardService.newTextButton()
            .setText('NEXUDUS')
            .setOpenLink(CardService.newOpenLink().setUrl(NEXUDUS_CALENDAR))
    )

const cardWithNotification = (e, targetCard, text = 'ERROR_MSG') => CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(text))
    .setNavigation(CardService.newNavigation().updateCard(targetCard(e)))
    .build()
