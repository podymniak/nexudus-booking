# Office Room Booking with Nexudus

## Disclaimer

I am neither associated with nor employed by Nexudus. My usage of their publicly available API and resources is solely for the educational purpose. This tool is created with the intention of developing my own skills and pursuing hobbies. Any reference to Nexudus or its services does not imply any official endorsement or partnership.

## Description
This tool is designed to facilitate room bookings from Google Calendar for office spaces that are integrated with the Nexudus booking system. 
- Currently, the tool operates only within the Warsaw timezone.

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
