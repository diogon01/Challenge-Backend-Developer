'use strict'
const fs = require('fs-extra')
const axios = require('axios')
const archiver = require('archiver');

class FileController {

  async index({request, response}) {

    try {

      // Delete old files
      await fs.emptyDir('./public/picturesToDownload');
      // Get images
      let data = this.getImages();
      // Download all images for array data.images
      await this.processImages(data);
      // Zip all images
      await this.zipImages();
      // Send file to download
      response.download('./public/picturesToDownload/images.zip')

    } catch (e) {
      response.send('error')
    }

  }

  async processImages(data) {
    for (const [index, image] of data.images.entries()) {
      await this.downloadImage(image, `./public/picturesToDownload/photo_${index}.png`)

    }
  }

  zipImages() {

    // create a file to stream archive data to.
    let output = fs.createWriteStream('./public/picturesToDownload/images.zip');
    let archive = archiver('zip', {
      zlib: {level: 9} // Sets the compression level.
    });

    return new Promise(((resolve, reject) => {
      archive
        .pipe(output)
        .on('close', function () {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
          resolve();
        })
        .on('error', function (err) {
          reject(err);
        });

      archive.glob('*.png', {
        cwd: './public/picturesToDownload',
        ignore: ['images.zip']
      });

      archive.finalize();

    }))

  }

  async downloadImage(url, image_path) {

    const response = await axios.get(url, {responseType: 'stream'});

    return new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(image_path))
        .on('finish', () => resolve(response.data))
        .on('error', e => {
            console.log(e);
            reject(e)
          }
        );
    });

  }

  getImages() {
    return {
      "images": [
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/d00ec210-9fe7-11e8-bc3b-4d2cc244f57b/original/529f6fa0-9fce-11e8-bc3b-4d2cc244f57b1534269004323.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/5d5695d0-be65-11e8-8948-0582190297ae/original/a15266f0-bdc1-11e8-8948-0582190297ae1537821934783.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/f4396d40-c024-11e8-9269-47e72002b83d/original/e788a230-bde2-11e8-8948-0582190297ae1537879857768.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/f4396d40-c024-11e8-9269-47e72002b83d/original/e788a230-bde2-11e8-8948-0582190297ae1537879856970.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/f4396d40-c024-11e8-9269-47e72002b83d/original/e788a230-bde2-11e8-8948-0582190297ae1537879855980.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/8bc2f120-efe8-11e8-831f-ab3f4e9099a7/original/9f6eeff0-ef50-11e8-831f-ab3f4e9099a71543240843045.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/8bc2f120-efe8-11e8-831f-ab3f4e9099a7/original/9f6eeff0-ef50-11e8-831f-ab3f4e9099a71543240841697.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/3b6e2ff0-bdd9-11e8-8948-0582190297ae/original/9f10c280-bd4c-11e8-8948-0582190297ae1537889769877.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/3b6e2ff0-bdd9-11e8-8948-0582190297ae/original/9f10c280-bd4c-11e8-8948-0582190297ae1537889771894.png",
        "https://devmissionbr.s3.us-west-2.amazonaws.com/photos/3b6e2ff0-bdd9-11e8-8948-0582190297ae/original/9f10c280-bd4c-11e8-8948-0582190297ae1537889771012.png"
      ]
    }
  }
}

module.exports = FileController;
