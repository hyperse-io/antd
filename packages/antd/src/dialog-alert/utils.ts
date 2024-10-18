export const bodyAppendDivElement = () => {
  const div = document.createElement('div');
  const id = `id_${Date.now()}`;
  div.setAttribute('id', id);
  document.body.append(div);
  return {
    divElement: div,
    elementId: id,
  };
};

export const removeBodyChild = (element: string) => {
  try {
    document.body.removeChild(document.querySelector(element) as Node);
  } catch (_error) {
    //
  }
};

export interface BodyAppendDivElementProps {
  divElement: HTMLDivElement;
  elementId: string;
}
