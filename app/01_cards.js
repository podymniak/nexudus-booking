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

    const section = CardService.newCardSection()
        .setHeader('📖 Bookings')
        // .setCollapsible(true)
        // .setNumUncollapsibleWidgets(2)

    const myFutureBookingsWidget = CardService.newSelectionInput()
        .setFieldName('free_slots')
        .setTitle('Future bookings:')
        .setType(CardService.SelectionInputType.CHECK_BOX)

    const myFutureBookingsList = []
    for (let bookingId in myFutureBookings) {
        myFutureBookingsList.push([myFutureBookings[bookingId], bookingId])
    }

    if (myFutureBookingsList.length===0) {
        section.addWidget(CardService.newTextParagraph().setText('No future bookings'))
    } else {
        myFutureBookingsList.sort()

        for (let i in myFutureBookingsList) {
            myFutureBookingsWidget
                .addItem(myFutureBookingsList[i][0], myFutureBookingsList[i][1], false)
        }

        section.addWidget(myFutureBookingsWidget)

        // const deleteBookingsButton = CardService.newTextButton()
        //     .setText('Delete selected bookings')
        //     .setOnClickAction(
        //         CardService.newAction().setFunctionName('deleteBookings')
        //     )
        //
        // section.addWidget(deleteBookingsButton)
    }

    return CardService.newCardBuilder()
        .setHeader(getHeader())
        .setFixedFooter(getFooter())
        .addSection(section)
        .addSection(sectionMap())
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

    /** Exclude events in the past */
    if (new Date(event?.end?.dateTime) < new Date()) {
        card.addSection(CardService.newCardSection().addWidget(
        CardService.newTextParagraph().setText("This event is in the past. You can't book a room for that time.")
      )
        )
        return card.build()
    }

    /** Existing event (excludes all day events (TODO exclude OOO)) */
    if (event?.start?.dateTime) {
        // console.log(event)
        const eventProps = readExtendedPropertiesFromEvent(event)
        card.addSection(bookingStatusSection(eventProps))
        card.addSection(availableResourcesSection(event))
        card.addSection(sectionMap())
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
const sectionMap = () => CardService.newCardSection().setHeader('🗺️ Office map')
    .addWidget(mapImage())

const mapImage = () => CardService.newImage()
    .setAltText('Office map')
    .setImageUrl(OFFICE_MINI_MAP)
    .setOpenLink( CardService.newOpenLink()
            .setUrl(OFFICE_MAP)
            .setOpenAs(CardService.OpenAs.OVERLAY)
        //  .setOnClose(CardService.OnClose.RELOAD)
    )


const bookingStatusSection = (eventProps) => {
    const section = CardService.newCardSection().setHeader('Booking Status')

    if (!eventProps.resourceId) {
        return section.addWidget(CardService.newTextParagraph().setText(`No room booked.`))
    }


    return section
        .addWidget(CardService.newTextParagraph()
            .setText(`<b>${eventProps.resourceName}</b>
      📅 ${eventProps.startTime.replace("T", " 🕒 ").split('+')[0]} - start
      📅 ${eventProps.endTime.replace("T", " 🕒 ").split('+')[0]} - end
      `))
        .addWidget(CardService.newTextButton()
            .setText("Delete booking")
            .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
            .setOnClickAction(
                CardService.newAction().setFunctionName('deleteBookingAction')
            ))
}

const availableResourcesSection = (event) => {
    // console.log(event)
    const section = CardService.newCardSection()

    const startTime = event.start.dateTime
    const endTime = event.end.dateTime

    const availableResources = getBookingCalendar(startTime, endTime)

    if (availableResources.length === 0) {
        return section.addWidget(CardService.newTextParagraph().setText('No available rooms on that time'))
    }

    const eventProperties = readExtendedPropertiesFromEvent(event)
    const bookingId = eventProperties.bookingId
    const eventResourceId = String(eventProperties.resourceId)

    const availableResourcesWidget = CardService.newSelectionInput()
        .setFieldName('selected_resource')
        .setTitle('Free rooms:')
        .setType(CardService.SelectionInputType.RADIO_BUTTON)

    for (let resourceName in availableResources) {
        let resourceId = availableResources[resourceName].toString()
        availableResourcesWidget
            .addItem(resourceName, `${resourceName}|;|${resourceId}`, resourceId===eventResourceId)
    }

    const bookButtonMessage = bookingId ? 'Update booking' : 'Book a room'

    const bookButton = CardService.newTextButton()
        .setText(bookButtonMessage)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(
            CardService.newAction().setFunctionName('createBookingAction')
        )

    return section
        .addWidget(availableResourcesWidget)
        .addWidget(bookButton)
}


/** NO PASSWORD CARD */
const noPasswordCard = () => {
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
                    ))
                .addWidget(CardService.newTextParagraph().setText(
                    'If you don\'t remember your password, try pasting this into your Chrome browser::<br><br><i>chrome://password-manager/passwords?q=nexudus</i>'))
        ).build()
}


/** COMMON */
const getHeader = (
    subtitle = 'Brought to you by Marta 🌷 ⁽ᵃⁿᵈ ᴹᵃˣ⁾',
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
            .setText('LOFTMILL')
            .setOpenLink(CardService.newOpenLink().setUrl(NEXUDUS_CALENDAR))
    )

const cardWithNotification = (e, targetCard, text = 'ERROR_MSG') => CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(text))
    .setNavigation(CardService.newNavigation().updateCard(targetCard(e)))
    .build()
