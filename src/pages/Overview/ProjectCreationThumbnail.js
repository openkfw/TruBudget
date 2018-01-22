import React from 'react';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import NotFilledStar from 'material-ui/svg-icons/toggle/star-border';
import FilledStar from 'material-ui/svg-icons/toggle/star';
import { storeProjectThumbnail } from './actions';
const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '75%',
    height: 450,
    overflowY: 'auto',
  },
};


const images = [
  {
    src: '/amazon_cover.jpg',
    title: 'rainforest'
  },
  {
    src: '/school.jpg',
    title: 'school'
  },
  {
    src: '/lego_avatar_male1.jpg',
    title: 'male1'
  },
  {
    src: '/lego_avatar_female2.jpg',
    title: 'female2'
  },
  {
    src: '/lego_avatar_male3.jpg',
    title: 'male3'
  },
  {
    src: '/lego_avatar_female4.jpg',
    title: 'female4'
  },
  {
    src: '/lego_avatar_male5.jpg',
    title: 'male5'
  },
  {
    src: '/lego_avatar_female6.jpg',
    title: 'female6'
  },
];

const setThumbnail = (previousSelectedThumbnail, selectedImage, storeProjectThumbnail) => {
  // If a user double click on a image we want to unselected it again
  if (previousSelectedThumbnail === selectedImage) {
    storeProjectThumbnail('')
  } else {
    storeProjectThumbnail(selectedImage);
  }
}
/**
 * A simple example of a scrollable `GridList` containing a [Subheader](/#/components/subheader).
 */
const ProjectCreationThumbnail = (props) => {
  const { projectThumbnail, storeProjectThumbnail } = props;
  return (
    <div style={styles.root}>
      <GridList
        cellHeight={180}
        cols={3}
        style={styles.gridList}
      >
        {images.map((image) => (
          <GridTile
            key={image.src}
            title={image.title}
            actionIcon=
            {<IconButton onClick={() => setThumbnail(projectThumbnail, image.src, storeProjectThumbnail)}>
              {
                image.src === projectThumbnail ? <FilledStar color="white" /> : <NotFilledStar color="white" />
              }
            </IconButton>}
          >
            <img src={image.src} />
          </GridTile>
        ))}
      </GridList>
    </div>
  );
}

export default ProjectCreationThumbnail;
