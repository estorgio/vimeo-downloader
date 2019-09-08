# vimeo-downloader

Download Vimeo embed videos offline for better user experience on slow connections.

## Usage

- Download and install [Node.js](https://nodejs.org/en)
- Clone this repository and install dependencies
  ```bash
  git clone https://github.com/estorgio/vimeo-downloader.git
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

## License

MIT
