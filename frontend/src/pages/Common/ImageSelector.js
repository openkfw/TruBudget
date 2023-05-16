import React from "react";

import FilledStar from "@mui/icons-material/Star";
import NotFilledStar from "@mui/icons-material/StarBorder";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Subheader from "@mui/material/ListSubheader";

import strings from "../../localizeStrings";

import { images } from "./images";

const styles = {
  root: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center"
  },
  gridList: {
    display: "flex",
    flexWrap: "nowrap",
    overflowX: "auto"
  },
  gridTile: {
    width: "100%",
    height: "100%"
  },
  subHeader: {
    paddingLeft: "0px"
  },
  tileBar: {
    background: "transparent",
    marginBottom: "50px"
  },
  listTile: {
    height: "100%"
  }
};

const ImageSelector = ({ onTouchTap, selectedImage }) => {
  return (
    <>
      <div style={styles.root}>
        <Subheader style={styles.subHeader}>{strings.common.thumbnail}</Subheader>
      </div>
      <div style={styles.root}>
        <ImageList
          rowHeight={150}
          sx={{
            width: "80%",
            height: 200,
            // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
            transform: "translateZ(0)"
          }}
        >
          {images.map((image) => (
            <ImageListItem onClick={() => onTouchTap(image.src)} key={image.src}>
              <img alt={image.src} src={image.src} />
              <ImageListItemBar
                actionIcon={
                  <IconButton aria-label="star icon" size="large">
                    {selectedImage === image.src ? <FilledStar color="primary" /> : <NotFilledStar color="primary" />}
                  </IconButton>
                }
                title=" " // Otherwise the action buttons would not be visible
                style={styles.tileBar}
                actionPosition="right"
              />
            </ImageListItem>
          ))}
        </ImageList>
      </div>
    </>
  );
};
export default ImageSelector;
