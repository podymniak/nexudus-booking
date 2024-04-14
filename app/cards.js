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


/** MAIN */
const homePageCard = e => {
    const myFutureBookings = listMyFutureBookings()
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
            .setText('Make usable slots')
            // .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(
                CardService.newAction().setFunctionName('saveBookings')
            )

        section.addWidget(myFutureBookingsWidget)
        section.addWidget(addSlotsButton)
    }

    return CardService.newCardBuilder()
        .setHeader(getHeader())
        .setFixedFooter(getFooter())
        .addSection(section)
        .build()
}


function eventCard(event) {
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
            CardService.newTextParagraph().setText('Unrecognized event')
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


const bookingStatusSection = (eventProps) => {
    const section = CardService.newCardSection().setHeader('Booking Status')

    if (!eventProps.resourceId) {
        return section.addWidget(CardService.newTextParagraph().setText(`No room booked.`))
    }

    return section.addWidget(CardService.newTextParagraph()
        .setText(`<b>${eventProps.resourceName}</b>
      ${eventProps.startTime.replace("T", " at ").split('+')[0]} - start
      ${eventProps.endTime.replace("T", " at ").split('+')[0]} - end
      `))
}


const availableResourcesSection = (event) => {
    const section = CardService.newCardSection().addWidget(availableBookingsWidget())

    if (getAvailableBookings().length === 0) {
        return section
    }

    // const availableResources = searchAvailableResources(event.start.dateTime, event.end.dateTime)
    const availableResources = findAvailableResources(event.start.dateTime, event.end.dateTime)

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
        .setText('Book room')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(
            CardService.newAction().setFunctionName('bookResource')
        )

    return section
        .addWidget(availableResourcesWidget)
        .addWidget(bookButton)
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
                    .setHint('WARNING! IT WILL BE VISIBLE')
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
    .setImageStyle(CardService.ImageStyle.SQUARE)
    .setImageUrl(icon)

const getFooter = () => CardService.newFixedFooter()
    .setPrimaryButton(
        CardService.newTextButton()
            // .setText('SHARE / RATE US')
            .setText('LOFTMIL')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOpenLink(CardService.newOpenLink().setUrl('https://warszawalixa.spaces.nexudus.com/bookings/calendar'))
    )
// .setSecondaryButton(
//     CardService.newTextButton()
//         .setText('CLICKUP')
//         .setOpenLink(CardService.newOpenLink().setUrl(CLICKUP_URL))
// )

const cardWithNotification = (e, targetCard, text = 'ERROR_MSG') => CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(text))
    .setNavigation(CardService.newNavigation().updateCard(targetCard(e)))
    .build()
