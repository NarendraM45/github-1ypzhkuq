import fs from 'fs';
import pngToIco from 'png-to-ico';

pngToIco('public/logo.png')
  .then(buf => {
    fs.writeFileSync('public/favicon.ico', buf);
    console.log('favicon.ico created successfully');
  })
  .catch(console.error);
