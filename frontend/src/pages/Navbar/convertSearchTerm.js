export const convertToURLQuery = searchBarString => {
  return searchBarString.replace(/[:]/g, "=").replace(/[ ]/g, "&");
};

export const convertToSearchBarString = urlQueryString => {
  return urlQueryString.replace(/[=]/g, ":").replace(/[&]/g, " ");
};
