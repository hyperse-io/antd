/**
 * Loading images with a CORS policy
 * returns a Promisized version of Image() api
 * When loading images from another domain with a CORS policy, you may find you need to use the crossorigin attribute.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes
 */
export const imagePromise =
  ({ decode = true, crossOrigin = '' }) =>
  (src): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const i = new Image();
      if (crossOrigin) i.crossOrigin = crossOrigin;
      i.onload = () => {
        if (decode && i.decode) {
          i.decode()
            .then(() => resolve(i))
            .catch(reject);
        } else {
          resolve(i);
        }
      };
      i.onerror = reject;
      i.src = src;
    });
  };
