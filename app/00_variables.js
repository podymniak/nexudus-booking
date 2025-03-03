const USER_EMAIL = Session.getEffectiveUser().getEmail()

/** Nexudus API variables */
const API_ENDPOINT = 'https://warszawalixa.spaces.nexudus.com/en'
const EXCLUDED_RESOURCES = [1415077508,1415074972,1415074973,1415179579,1415179478]

/** Google Calendar variables */
const PRIMARY_CALENDAR = 'primary'

/** URLs */
const PRIMARY_BUTTON_LINK = 'https://workspace.google.com/marketplace/app/room_booking/375198058937'
const NEXUDUS_LOCAL_WEBSITE = 'https://warszawalixa.spaces.nexudus.com'
const NEXUDUS_CALENDAR = `${NEXUDUS_LOCAL_WEBSITE}/bookings/calendar`
const OFFICE_MAP = "https://drive.google.com/file/d/1sa43ivNQgQx3TcLhCuaUXkOYzPCyajzV/preview"

/** Script/user properties' names */
const VIP_USERS = 'VIP_USERS'
const SAVED_BOOKINGS_NAME = 'SAVED_BOOKINGS'
const BOOKED_BOOKINGS_NAME = 'BOOKED_BOOKINGS'
// const REFRESH_TOKEN_NAME = 'REFRESH_TOKEN'
const ACCESS_TOKEN_NAME = 'ACCESS_TOKEN'
const PASSWORD_NAME = 'PASSWORD'
const COWORKER_ID_NAME = 'COWORKER_ID'

/** Special VIP section */
const setVIPs = (value='comma,separated.emails') => PropertiesService.getUserProperties().setProperty(VIP_USERS, value)
const VIPS = (PropertiesService.getUserProperties().getProperty(VIP_USERS) || '').split(',')
const MAX_SLOTS = VIPS.includes(USER_EMAIL) ? 20 : 10
