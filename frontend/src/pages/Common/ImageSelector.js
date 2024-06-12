import React, { useEffect, useRef } from "react";

import FilledStar from "@mui/icons-material/Star";
import NotFilledStar from "@mui/icons-material/StarBorder";
import Avatar from "@mui/material/Avatar";
import blue from "@mui/material/colors/indigo";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Subheader from "@mui/material/ListSubheader";

import strings from "../../localizeStrings";

import { images } from "./images";
import ImageUploader from "./ImageUploader";

import "./ImageSelector.scss";

const ImageSelector = ({ onTouchTap, selectedImage, customImage, setImage, removeImage }) => {
  const customImageGalleryRef = useRef(null);

  const displayCustomImage = customImage && customImage !== "";
  const imagesToDisplay = displayCustomImage ? [{ src: customImage }, ...images] : images;

  useEffect(() => {
    customImageGalleryRef.current.scroll({ top: 0, behavior: "smooth" });
  }, [customImage]);

  return (
    <>
      <div className="root">
        <Subheader className="sub-header">{strings.common.thumbnail}</Subheader>
      </div>
      <div className="root" id="project-detail-cover-image-gallery">
        <ImageList
          rowHeight={150}
          sx={{
            width: "80%",
            height: 200,
            // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
            transform: "translateZ(0)"
          }}
          ref={customImageGalleryRef}
        >
          {imagesToDisplay.map((image, index) => (
            <ImageListItem onClick={() => onTouchTap(image.src)} key={image.src} className="image-list-item">
              <img alt={image.src} src={image.src} />
              <ImageListItemBar
                actionIcon={
                  <IconButton aria-label="star icon" size="large">
                    {selectedImage === image.src ? (
                      <Avatar sx={{ bgcolor: blue[500] }}>
                        <FilledStar color="white" />
                      </Avatar>
                    ) : (
                      <Avatar sx={{ bgcolor: "#cccccc" }}>
                        <NotFilledStar color="white" />
                      </Avatar>
                    )}
                  </IconButton>
                }
                title=" " // Otherwise the action buttons would not be visible
                className="tile-bar"
                actionPosition="right"
              />
            </ImageListItem>
          ))}
        </ImageList>
      </div>
      <div className="image-uploader">
        <div>select picture from gallery or upload custom picture</div>
        <ImageUploader setImage={setImage} removeImage={removeImage} image={customImage} />
      </div>
    </>
  );
};
export default ImageSelector;
