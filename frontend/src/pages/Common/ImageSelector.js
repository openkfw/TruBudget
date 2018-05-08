import React from "react";
import Subheader from "material-ui/List/ListSubheader";
import { GridList, GridTile } from "material-ui/GridList";
import IconButton from "material-ui/IconButton";
import NotFilledStar from "@material-ui/icons/StarBorder";
import FilledStar from "@material-ui/icons/Star";
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
  }
};

const ImageSelector = ({ onTouchTap, selectedImage }) => {
  return (
    <div style={styles.root}>
      <Subheader style={styles.subHeader}>Thumbnail</Subheader>
      <GridList cellHeight={100} style={styles.gridList}>
        {images.map(image => (
          <GridTile
            onTouchTap={() => onTouchTap(image.src)}
            key={image.src}
            style={styles.gridTile}
            title=" " // Otherwise the action buttons would not be visible
            actionIcon={
              <IconButton>
                {" "}
                {selectedImage === image.src ? <FilledStar color="white" /> : <NotFilledStar color="white" />}
              </IconButton>
            }
            actionPosition="right"
            titlePosition="top"
            titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
          >
            <img alt={image.src} src={image.src} />
          </GridTile>
        ))}
      </GridList>
    </div>
  );
};
export default ImageSelector;
