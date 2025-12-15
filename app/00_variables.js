const USER_EMAIL = Session.getEffectiveUser().getEmail()

/** Nexudus API variables */
const API_ENDPOINT = 'https://warszawalixa.spaces.nexudus.com/en'
// const EXCLUDED_RESOURCES = [1415077508,1415074972,1415074973,1415179579,1415179478]
const EXCLUDED_RESOURCES = []
const USE_OWN_ROOM_LIST = true  // Defined in OFFICE_ROOMS below

/** Google Calendar variables */
const PRIMARY_CALENDAR = 'primary'

/** URLs */
const PRIMARY_BUTTON_LINK = 'https://workspace.google.com/marketplace/app/room_booking/375198058937'
const NEXUDUS_LOCAL_WEBSITE = 'https://warszawalixa.spaces.nexudus.com'
const NEXUDUS_CALENDAR = `${NEXUDUS_LOCAL_WEBSITE}/bookings/calendar`
const OFFICE_MAP = "https://drive.google.com/file/d/1Am91VuLxPFYGyD_oTD3q8kzIBAVVh-SI/preview"
const OFFICE_MINI_MAP = "https://raw.githubusercontent.com/podymniak/nexudus-booking/refs/heads/main/mapa_pokoi_v3_mini.png"
const TEA_BREAK_LOGO = "https://raw.githubusercontent.com/podymniak/podymniak.github.io/refs/heads/main/images/_teaBreakColorInverted.png_"
// TODO make small logo
// Mini map must be in a small resolution and publicly available

/** Script/user properties' names */
// const REFRESH_TOKEN_NAME = 'REFRESH_TOKEN'
const ACCESS_TOKEN_NAME = 'ACCESS_TOKEN'
const PASSWORD_NAME = 'PASSWORD'
const COWORKER_ID_NAME = 'COWORKER_ID'

/** Office-specific rooms */
const OFFICE_ROOMS = {
    'Koral': 1415074866,
    'Turkus': 1415074870,
    'Diament': 1415074968,
    '⚠️ Jadeit (0th floor)': 1415074972,
    '⚠️ Turmalin (0th floor)': 1415074973,
    'Bursztyn': 1415163151,
    'Perła': 1415074867,
    'Malachit': 1415074869,
    'Cytryn': 1415074872,
    'Rubin': 1415074969,
    'Onyks': 1415074970,
    // 'Chillout': 1415077508,
    'Jaspis': 1415074971,
}

const OFFICE_ROOMS_BY_ID = Object.fromEntries(
    Object.entries(OFFICE_ROOMS).map(([name, id]) => [id, name])
)
