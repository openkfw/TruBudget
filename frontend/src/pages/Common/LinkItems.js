import React from "react";
import { Link } from "react-router-dom";

import DatasetLinkedIcon from "@mui/icons-material/DatasetLinked";
import { Avatar, ListItem, ListItemAvatar, Typography } from "@mui/material";

const displayLinks = (links) => {
  return links.map((link, idx) => (
    <Typography variant="body2" mt={2} key={`${link}-${idx}`}>
      <Link to={`${link}`} key={`${link}-${idx}`}>
        {link}
      </Link>
    </Typography>
  ));
};

const LinkItems = ({ projectComment }) => {
  const regex = /(?<=\s)\/projects[^\s,\.]*/g;
  const matches = projectComment.match(regex);

  return matches && matches.length > 0 ? (
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          <DatasetLinkedIcon />
        </Avatar>
      </ListItemAvatar>
      <>{displayLinks(matches)}</>
    </ListItem>
  ) : null;
};

export default LinkItems;
