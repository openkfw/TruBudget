import React from "react";

import FilledStar from "@mui/icons-material/Star";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import NotFilledStar from "@mui/icons-material/StarBorder";
import Subheader from "@mui/material/ListSubheader";
import { withStyles } from "@mui/styles";

import strings from "../../localizeStrings";
import { images } from "./images";

const styles = {
  root: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "space-around"
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

const ImageSelector = ({ onTouchTap, selectedImage, classes }) => {
  return (
    <div style={styles.root}>
      <Subheader style={styles.subHeader}>{strings.common.thumbnail}</Subheader>
      <ImageList cellHeight={150} style={styles.gridList}>
        {images.map(image => (
          <ImageListItem onClick={() => onTouchTap(image.src)} key={image.src}>
            <img alt={image.src} src={image.src} />
            <ImageListItemBar
              actionIcon={
                <IconButton size="large">
                  {selectedImage === image.src ? <FilledStar color="primary" /> : <NotFilledStar color="primary" />}
                </IconButton>
              }
              title=" " // Otherwise the action buttons would not be visible
              className={classes.tileBar}
              actionPosition="right"
              titlePosition="top"
              titlebackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            />
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
};
export default withStyles(styles)(ImageSelector);
