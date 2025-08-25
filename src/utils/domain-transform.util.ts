export const domainTransform = (domain: string, url: string) => {
  const concatUrl = domain + url;

  const match = /^(.+)\?/.exec(concatUrl);

  if (match) {
    return match[1];
  }

  return concatUrl;
};
