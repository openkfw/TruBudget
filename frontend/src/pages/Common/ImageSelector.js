import React from "react";

import FilledStar from "@material-ui/icons/Star";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import NotFilledStar from "@material-ui/icons/StarBorder";
import Subheader from "@material-ui/core/ListSubheader";
import { withStyles } from "@material-ui/core/styles";

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
      <GridList cellHeight={150} style={styles.gridList}>
        {images.map(image => (
          <GridListTile onClick={() => onTouchTap(image.src)} key={image.src}>
            <img alt={image.src} src={image.src} />
            <GridListTileBar
              actionIcon={
                <IconButton>
                  {selectedImage === image.src ? <FilledStar color="primary" /> : <NotFilledStar color="primary" />}
                </IconButton>
              }
              title=" " // Otherwise the action buttons would not be visible
              className={classes.tileBar}
              actionPosition="right"
              titlePosition="top"
              titlebackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};
export default withStyles(styles)(ImageSelector);
