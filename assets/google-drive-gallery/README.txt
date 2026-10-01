BCRLS GOOGLE DRIVE PHOTO GALLERY — ONE-TIME SETUP

The website intentionally does NOT show the Google Drive folder itself.
Instead, it asks a small Google Apps Script feed for the image list and
then displays the images one-by-one as a 3-second slideshow.

1. Open script.google.com and create a new project.
2. Replace the default Code.gs contents with assets/google-drive-gallery/Code.gs.
3. Deploy > New deployment > Web app.
4. Execute as: Me
5. Who has access: Anyone
6. Copy the Web app URL.
7. Open js/media-gallery-config.js and set:
   feedUrl: "YOUR_WEB_APP_URL"
8. Make sure images in the Drive folder can be viewed by website visitors.

The feed sorts images by Google Drive creation time (upload order). The
website refreshes the feed periodically, so later uploads are picked up
automatically. The gallery never displays the Drive folder/link itself.
