/**
 * BCRLS Google Drive Photo Gallery feed
 *
 * 1. Put this code into Google Apps Script.
 * 2. Deploy as Web app: Execute as Me; Who has access: Anyone.
 * 3. Put the deployment URL in js/media-gallery-config.js as feedUrl.
 *
 * Images are returned in upload order (oldest -> newest). The website polls
 * this endpoint periodically, so newly uploaded images can appear without
 * changing the website code.
 */
const FOLDER_ID = '1bcNSw114VUJUXqM2G0KeagFHuTb5hgl4';

function doGet(e) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = [];
  const iterator = folder.getFiles();

  while (iterator.hasNext()) {
    const file = iterator.next();
    const mime = file.getMimeType() || '';
    if (!mime.startsWith('image/')) continue;

    files.push({
      id: file.getId(),
      name: file.getName(),
      createdTime: file.getDateCreated().toISOString(),
      updatedTime: file.getLastUpdated().toISOString(),
      url: 'https://drive.google.com/uc?export=view&id=' + encodeURIComponent(file.getId())
    });
  }

  files.sort((a, b) => {
    const aTime = new Date(a.createdTime).getTime();
    const bTime = new Date(b.createdTime).getTime();
    return aTime - bTime;
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      folderId: FOLDER_ID,
      count: files.length,
      images: files
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
