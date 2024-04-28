# Office Room Booking with Nexudus

## Disclaimer

I am neither associated with nor employed by Nexudus. My usage of their publicly available API and resources is solely for the educational purpose. This tool is created with the intention of developing my own skills and pursuing hobbies. Any reference to Nexudus or its services does not imply any official endorsement or partnership.

## Description
This tool is designed to facilitate room bookings for office spaces that are integrated with Nexudus. Please note that creating new bookings is not possible with the public API, thus requiring initial setup. The setup process is described below.
- Currently, the tool operates within the Warsaw timezone (will be fixed later).

## How to Push to Google Apps Script

1. **Install Node.js:** [Download Node.js](https://nodejs.org/en/download)
2. **Install Dependencies:**
    ```bash
    npm i
    ```
3. **Enable Google Apps Script API:** Visit [Google Apps Script API](https://script.google.com/home/usersettings) and enable it for the account you will use for development.
4. **Authenticate in Clasp:**
    ```bash
    clasp login
    ```
5. **Replace Script ID in Clasp:** Replace the script ID in Clasp with your script ID.
6. **Create New Deployment in Apps Script:** [Follow the link for detailed instructions](https://developers.google.com/apps-script/add-ons/how-tos/testing-workspace-addons)

## How to Publish Add-on

If you want your add-on to be available to everybody in your domain, you can do it for free by following these steps: [Instructions](https://developers.google.com/workspace/marketplace/how-to-publish)

## Booking Rooms with the Add-on

This API uses Public API from Nexudus. This tool doesn't allow creating new bookings, but it is possible to update existing ones.

Because of that the addon requires a small one-time set-up:
1. Create up to 3 dummy bookings in Nexudus - schedule them outside of working hours, so as not to take a room from someone who needs it.
2. Refresh addon, choose your dummy bookings and press the button.

Now you can book rooms from your calendar!

The limit is set to 3, to spot people from hugging too many rooms for themselves. After your meeting passes, your slot will be available again, so no need to repeat these steps.