export const fileToBase64: (file: File) => Promise<string> = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = function (error) {
        reject(error);
      };
    } catch (error) {
      reject(error);
    }
  });
};
