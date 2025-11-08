const USER_EMAIL = Session.getEffectiveUser().getEmail()

/** Nexudus API variables */
const API_ENDPOINT = 'https://warszawalixa.spaces.nexudus.com/en'
const EXCLUDED_RESOURCES = [1415077508,1415074972,1415074973,1415179579,1415179478]
// const EXCLUDED_RESOURCES = []

/** Google Calendar variables */
const PRIMARY_CALENDAR = 'primary'

/** URLs */
const PRIMARY_BUTTON_LINK = 'https://workspace.google.com/marketplace/app/room_booking/375198058937'
const NEXUDUS_LOCAL_WEBSITE = 'https://warszawalixa.spaces.nexudus.com'
const NEXUDUS_CALENDAR = `${NEXUDUS_LOCAL_WEBSITE}/bookings/calendar`
const OFFICE_MAP = "https://drive.google.com/file/d/1CmEWRw0SkgGf7UTCmtBwxHwpWDOTDAfn/preview"
const OFFICE_MINI_MAP = "https://raw.githubusercontent.com/podymniak/nexudus-booking/refs/heads/main/mapa_pokoi_v3_mini.png"
const TEA_BREAK_LOGO = "https://raw.githubusercontent.com/podymniak/podymniak.github.io/refs/heads/main/images/_teaBreakColorInverted.png_"
// TODO make small logo
// Mini map must be in a small resolution and publicly available

/** Script/user properties' names */
// const REFRESH_TOKEN_NAME = 'REFRESH_TOKEN'
const ACCESS_TOKEN_NAME = 'ACCESS_TOKEN'
const PASSWORD_NAME = 'PASSWORD'
const COWORKER_ID_NAME = 'COWORKER_ID'
