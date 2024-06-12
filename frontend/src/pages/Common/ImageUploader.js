import React from "react";
import imageCompression from "browser-image-compression";

import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Button from "@mui/material/Button";

const ImageUploader = ({ image, setImage, removeImage, maxSizeMB = 1, displayImage = false }) => {
  const compressImage = async (event, useWebWorker = true) => {
    const file = event.target.files[0];

    // if (!file) {
    //   dispatch(setClientLoading(false));
    //   return;
    // }

    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    const orientation = await imageCompression.getExifOrientation(file);

    const imageOptions = {
      maxSizeMB,
      useWebWorker: useWebWorker,
      exifOrientation: orientation
    };

    const output = await imageCompression(file, imageOptions);

    const base64ImagePhoto = await imageCompression.getDataUrlFromFile(output);

    setImage(base64ImagePhoto);
  };

  return (
    <>
      {displayImage && <img src={`data:image/png;base64,${image}`} alt="" />}
      <label htmlFor="uploadImageResized">
        <Button color="primary" aria-label="upload picture" component="span">
          <PhotoCamera /> Upload
        </Button>
      </label>
      <input
        id="uploadImageResized"
        value={[]}
        type="file"
        accept="image/*"
        onChange={compressImage}
        style={{ display: "none" }}
      />
    </>
  );
};

export default ImageUploader;
