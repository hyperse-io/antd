import { classNames } from '@dimjs/utils';
import { generateIntArray } from '@hyperse/utils';
import { Pdf } from '../pdf/index.js';
import { RollLocationInView } from '../roll-location-in-view/in-view.js';

type NavigationProps = {
  numPages: number;
  activeNumber: number;
  onChangeActiveNumber: (active: number) => void;
  scale?: number;
  navigationWidth?: number;
  pdfPageListHeightScope: number[][];
  pdfContentNodeId: string;
};
export const Navigation = (props: NavigationProps) => {
  const navigationWidth =
    typeof props.navigationWidth === 'undefined' ? 200 : props.navigationWidth;
  return (
    <RollLocationInView
      activeKey={`${props.activeNumber}`}
      behavior="auto"
      style={{ width: navigationWidth }}
      renderList={generateIntArray(1, props.numPages + 1).map((pageNumer) => {
        return {
          activeKey: `${pageNumer}`,
          render: (
            <div
              key={pageNumer}
              className={classNames('v-pdf-preview-navigation-content', {
                'v-pdf-preview-navigation-active':
                  pageNumer === props.activeNumber,
              })}
            >
              <Pdf.Page
                pageNumber={pageNumer}
                gap={0}
                scale={props.scale || 0.2}
                className={classNames('v-pdf-preview-navigation-page')}
                onClick={() => {
                  props.onChangeActiveNumber(pageNumer);
                  const scroll = document.querySelector(
                    `#${props.pdfContentNodeId}`
                  ) as HTMLDivElement;
                  if (scroll) {
                    if (pageNumer === 1) {
                      scroll.scrollTo(0, 0);
                    } else {
                      const top =
                        props.pdfPageListHeightScope[pageNumer - 1][0];
                      scroll.scrollTo(0, top);
                    }
                  }
                }}
              ></Pdf.Page>

              <div className="v-pdf-preview-navigation-pagination">
                - {pageNumer} -
              </div>
            </div>
          ),
        };
      })}
    />
  );
};
