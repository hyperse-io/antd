import { imagePromise } from './image-promise.js';

export type LoadImageProps = {
  srcList: Array<string>;
  decode?: boolean;
  crossOrigin?: string;
};
const cache = {};

// sequential map.find for promises
const promiseFind = (
  srcList: string[],
  promiseFactory: (src: string) => Promise<HTMLImageElement>
) => {
  const queueNext = (src: string) => {
    if (cache[src]) {
      return Promise.resolve(cache[src]);
    } else {
      return promiseFactory(src).then((image: HTMLImageElement) => {
        cache[src] = image;
        return image;
      });
    }
  };
  const task: Array<Promise<HTMLImageElement>> = [];
  for (let i = 0; i < srcList.length; i++) {
    task.push(queueNext(srcList[i]));
  }
  return Promise.all(task);
};

/**
 * https://github.com/mbrevda/react-image/blob/master/src/Img.tsx
 * Uses the useImage hook internally which encapsulates all the image loading logic.
 * This hook works with React Suspense by default and will suspend painting until the image is downloaded and decoded by the browser.
 * @returns
 */
export function loadImage({
  srcList,
  decode = true,
  crossOrigin = '',
}: LoadImageProps) {
  // when promise resolves/reject, update cache & state
  return (
    promiseFind(srcList, imagePromise({ decode, crossOrigin }))
      // if a source was found, update cache
      // when not using suspense, update state to force a rerender
      .then(() => {
        return srcList;
      })

      // if no source was found, or if another error occured, update cache
      // when not using suspense, update state to force a rerender
      .catch(() => {
        return null;
      })
  );
}

export function loadImageWithImage({
  srcList,
  decode = true,
  crossOrigin = '',
}: LoadImageProps) {
  // when promise resolves/reject, update cache & state
  return (
    promiseFind(srcList, imagePromise({ decode, crossOrigin }))
      // if a source was found, update cache
      // when not using suspense, update state to force a rerender
      .then((result) => {
        return result;
      })

      // if no source was found, or if another error occured, update cache
      // when not using suspense, update state to force a rerender
      .catch(() => {
        return null;
      })
  );
}
