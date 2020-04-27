export default () => {
  let highlightingRegex;
  onmessage = ({ data: { projects, searchTerm } }) => {
    const filteredProjects = filterProjects(projects, searchTerm);
    postMessage(filteredProjects);
  };

  const filterProjects = (projects, searchTermString) => {
    const unfilteredSearchTerms = searchTermString.split(" ");
    const searchedDisplayNames = extractFromSearchTerms(unfilteredSearchTerms, "name");
    const searchedTags = extractFromSearchTerms(unfilteredSearchTerms, "tag");
    const searchedStatus = extractFromSearchTerms(unfilteredSearchTerms, "status");
    const searchTermsWithoutPrefix = unfilteredSearchTerms.filter(
      searchTerm => !searchTerm.includes(":") && searchTerm.length !== 0
    );
    // Create highligthingRegex from all filtered searchterms
    const filteredSearchTerms = searchTermsWithoutPrefix.concat(searchedDisplayNames, searchedTags, searchedStatus);
    highlightingRegex = filteredSearchTerms.length !== 0 ? generateHighligthingRegex(filteredSearchTerms) : "";

    const filteredProjects = projects.filter(project => {
      let hasDisplayName = true;
      let hasStatus = true;
      let hasTag = true;
      let hasSearchTerm = true;
      // Only call functions when searching for it explicitly
      if (searchedDisplayNames.length !== 0) hasDisplayName = includesDisplayName(project, searchedDisplayNames);
      if (searchedStatus.length !== 0) hasStatus = includesStatus(project, searchedStatus);
      if (searchedTags && searchedTags.length !== 0) hasTag = includesTag(project, searchedTags);
      if (searchTermsWithoutPrefix.length !== 0) hasSearchTerm = includesSearchTerm(project, searchTermsWithoutPrefix);
      return hasDisplayName && hasStatus && hasTag && hasSearchTerm;
    });

    return { filteredProjects, searchTerms: filteredSearchTerms, highlightingRegex };
  };

  const extractFromSearchTerms = (searchTerms, prefix) => {
    return searchTerms.reduce((extractedTerms, searchTerm) => {
      const searchTermPrefix = searchTerm.replace(/:/, " ").split(" ")[0];
      if (searchTermPrefix === prefix) {
        const searchTermWithoutPrefix = searchTerm.replace(/:/, " ").split(" ")[1];
        if (searchTermWithoutPrefix) {
          extractedTerms.push(searchTermWithoutPrefix);
        }
      }
      return extractedTerms;
    }, []);
  };

  function includesSearchTerm(project, searchTermsWithoutPrefix) {
    return searchTermsWithoutPrefix.every(searchTerm => {
      return (
        project.data.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.data.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.data.tags !== undefined
          ? project.data.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          : false)
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

  function generateHighligthingRegex(searchTerms) {
    const regexString = searchTerms.reduce((string, searchTerm) => {
      return string.concat("|" + searchTerm);
    });
    return new RegExp("(" + regexString + ")", "i");
  }
};
