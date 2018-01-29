import React from 'react';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import NotFilledStar from 'material-ui/svg-icons/toggle/star-border';
import FilledStar from 'material-ui/svg-icons/toggle/star';
import { storeProjectThumbnail } from './actions';
import { ACMECorpDarkBlue, ACMECorpLightgreen } from '../../colors';

const images = [
  {
    src: '/Thumbnail_0001.jpg',
  },
  {
    src: '/Thumbnail_0002.jpg',
  },
  {
    src: '/Thumbnail_0003.jpg',
  },
  {
    src: '/Thumbnail_0004.jpg',
  },
  {
    src: '/Thumbnail_0005.jpg',
  },
  {
    src: '/Thumbnail_0006.jpg',
  },
  {
    src: '/Thumbnail_0007.jpg',
  },
  {
    src: '/Thumbnail_0008.jpg',
  },
  {
    src: '/Thumbnail_0009.jpg',
  },
  {
    src: '/Thumbnail_0010.jpg',
  },
  {
    src: '/Thumbnail_0011.jpg',
  },
  {
    src: '/Thumbnail_0012.jpg',
  },
  {
    src: '/Thumbnail_0013.jpg',
  },
  {
    src: '/Thumbnail_0014.jpg',
  },
  {
    src: '/Thumbnail_0015.jpg',
  },
  {
    src: '/Thumbnail_0016.jpg',
  },
  {
    src: '/Thumbnail_0017.jpg',
  },
  {
    src: '/Thumbnail_0018.jpg',
  },
  {
    src: '/Thumbnail_0019.jpg',
  },
  {
    src: '/Thumbnail_0020.jpg',
  },
  {
    src: '/Thumbnail_0021.jpg',
  },
  {
    src: '/Thumbnail_0022.jpg',
  },
  {
    src: '/Thumbnail_0023.jpg',
  },
  {
    src: '/Thumbnail_0024.jpg',
  },

];

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '90%',
    height: 450,
    overflowY: 'auto',
  },
};

/**
 * A simple example of a scrollable `GridList` containing a [Subheader](/#/components/subheader).
 */
const ProjectCreationThumbnail = (props) => {
  const { projectThumbnail, storeProjectThumbnail } = props;
  return (
    <div style={styles.root}>
      <GridList
        cellHeight={180}
        cols={4}
        style={styles.gridList}
      >
        {images.map((image) => (
          <GridTile
            onTouchTap={() => storeProjectThumbnail(image.src)}
            key={image.src}
            title=' ' // Otherwise the action buttons would not be visible
            actionIcon={<IconButton> {
              projectThumbnail === image.src ?
                <FilledStar color="white" /> : <NotFilledStar color="white" />
            }</IconButton>}
            actionPosition="right"
            titlePosition="top"
            titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
          >
            <img src={image.src} />
          </GridTile>
        ))
        }
      </GridList >
    </div >
  );
}

export default ProjectCreationThumbnail;
