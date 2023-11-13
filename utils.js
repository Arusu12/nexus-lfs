function isImage(fileName) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico'];
  const ext = fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(ext);
}

function getIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'pdf.png';
    case 'doc':
    case 'docx':
      return 'word.png';
    case 'xls':
    case 'xlsx':
      return 'excel.png';
    case 'ppt':
    case 'pptx':
      return 'ppt.png';
    case 'zip':
      return 'zip.png';
    default:
      return 'file.png';
  }
}

module.exports = { isImage, getIcon };
