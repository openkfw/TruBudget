import _isEmpty from "lodash/isEmpty";

const filterProjects = (projects, searchTermString) => {
  const unfilteredSearchTerms = searchTermString.split(" ");
  const searchedDisplayNames = extractFromSearchTerms(unfilteredSearchTerms, "name");
  const searchedTags = extractFromSearchTerms(unfilteredSearchTerms, "tag");
  const searchedStatus = extractFromSearchTerms(unfilteredSearchTerms, "status");
  const searchTermsWithoutPrefix = unfilteredSearchTerms.filter(searchTerm => !searchTerm.includes(":"));

  return projects.filter(project => {
    let hasDisplayName = true;
    let hasStatus = true;
    let hasTag = true;
    let hasSearchTerm = true;

    // Only call functions when searching for it explicitly
    if (!_isEmpty(searchedDisplayNames)) hasDisplayName = includesDisplayName(project, searchedDisplayNames);
    if (!_isEmpty(searchedStatus)) hasStatus = includesStatus(project, searchedStatus);
    if (!_isEmpty(searchedTags)) hasTag = includesTag(project, searchedTags);
    if (!_isEmpty(searchTermsWithoutPrefix)) hasSearchTerm = includesSearchTerm(project, searchTermsWithoutPrefix);

    return hasDisplayName && hasStatus && hasTag && hasSearchTerm;
  });
};

const extractFromSearchTerms = (searchTerms, prefix) => {
  return searchTerms.reduce((extractedTerms, searchTerm) => {
    const searchTermPrefix = searchTerm.replace(/:/, " ").split(" ")[0];
    if (searchTermPrefix === prefix) {
      const searchTermWithoutPrefix = searchTerm.replace(/:/, " ").split(" ")[1];
      if (searchTermWithoutPrefix) extractedTerms.push(searchTermWithoutPrefix);
    }
    return extractedTerms;
  }, []);
};

function includesSearchTerm(project, searchTermsWithoutPrefix) {
  return searchTermsWithoutPrefix.some(searchTerm => {
    return (
      project.data.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.data.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.data.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.data.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
}

function includesTag(project, searchedTags) {
  return project.data.tags.some(projectTag =>
    searchedTags.some(extractedTag => projectTag.toLowerCase().includes(extractedTag.toLowerCase()))
  );
}

function includesStatus(project, searchedStatus) {
  return searchedStatus.some(status => {
    return project.data.status.toLowerCase().includes(status.toLowerCase());
  });
}

function includesDisplayName(project, searchedDisplayNames) {
  return searchedDisplayNames.some(displayName =>
    project.data.displayName.toLowerCase().includes(displayName.toLowerCase())
  );
}

export default filterProjects;
