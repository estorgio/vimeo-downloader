# vimeo-downloader

Download Vimeo embed videos offline for better user experience on slow connections.

## Usage

### Single download

- Download and install [Node.js](https://nodejs.org/en)
- Clone this repository and install dependencies
  ```bash
  git clone https://github.com/estorgio/vimeo-downloader.git
  cd vimeo-downloader
  npm i
  ```
- Create an `.env` file and supply all the fields with your video url and save path
  ```
  VIDEO_URL="https://player.vimeo.com/video/123456789"
  OUTPUT_PATH="./samplevid.mp4"
  ```
- Run the script and start the download

  ```bash
  npm start
  ```

### Bulk download

- Download and install [Node.js](https://nodejs.org/en)
- Clone this repository and install dependencies
  ```bash
  git clone https://github.com/estorgio/vimeo-downloader.git
  cd vimeo-downloader
  npm i
  ```
- Create a `.bulkdownload` file and use the JSON snippet below as a template

  ```json
  {
    "saveDirectory": "./savedir",
    "videos": [
      {
        "url": "https://player.vimeo.com/video/123456789",
        "filename": "video1.mp4"
      },
      {
        "url": "https://player.vimeo.com/video/987654321",
        "filename": "video2.mp4"
      }
    ]
  }
  ```

- Run the script and start the bulk download

  ```bash
  npm run bulk
  ```

## License

MIT
