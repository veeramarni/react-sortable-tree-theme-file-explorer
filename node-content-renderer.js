import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import styles from './node-content-renderer.scss';

function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== 'function' &&
    older.children.some(
      child => child === younger || isDescendant(child, younger)
    )
  );
}

// eslint-disable-next-line react/prefer-stateless-function
class FileThemeNodeContentRenderer extends Component {
  render() {
    const {
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      icons,
      buttons,
      className,
      style,
      didDrop,
      lowerSiblingCounts,
      listIndex,
      swapFrom,
      swapLength,
      swapDepth,
      treeId, // Not needed, but preserved for other renderers
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      rowDirection,
      ...otherProps
    } = this.props;

    const nodeTitle = title || node.title;

    // const formatTitle = (search, replace, data) => {
    //   if(data &&  search && data.search(search) !== -1) {
    //     var re = new RegExp(search, "g");
    //     if (!replace) {
    //       const result = data.replace(re, `<span style="background-color: rgba(234, 92, 0, 0.33);">${search}</span>`);
    //       return result
    //     } else {
    //       const result = data.replace(re, `<span style="text-decoration: line-through; background-color: rgba(255, 0, 0, 0.2);">${search}</span><mark style="background-color: rgba(155, 185, 85, 0.2)">${replace}</mark>`);
    //       return result
    //     }
    //   }
    //   return data
    // };

    // const newTitle = !node.isDirectory ? formatTitle(node.search, node.replace, nodeTitle) : nodeTitle;

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    // Construct the scaffold representing the structure of the tree
    const scaffold = [];
    lowerSiblingCounts.forEach((lowerSiblingCount, i) => {
      scaffold.push(
        <div
          key={`pre_${1 + i}`}
          style={{ width: scaffoldBlockPxWidth }}
          className={styles.lineBlock}
        />
      );

      if (treeIndex !== listIndex && i === swapDepth) {
        // This row has been shifted, and is at the depth of
        // the line pointing to the new destination
        let highlightLineClass = '';

        if (listIndex === swapFrom + swapLength - 1) {
          // This block is on the bottom (target) line
          // This block points at the target block (where the row will go when released)
          highlightLineClass = styles.highlightBottomLeftCorner;
        } else if (treeIndex === swapFrom) {
          // This block is on the top (source) line
          highlightLineClass = styles.highlightTopLeftCorner;
        } else {
          // This block is between the bottom and top
          highlightLineClass = styles.highlightLineVertical;
        }

        scaffold.push(
          <div
            key={`highlight_${1 + i}`}
            style={{
              width: scaffoldBlockPxWidth,
              left: scaffoldBlockPxWidth * i,
            }}
            className={`${styles.absoluteLineBlock} ${highlightLineClass}`}
          />
        );
      }
    });

    const nodeContent = (
      <div style={{ height: '100%' }} {...otherProps}>
        {toggleChildrenVisibility &&
          node.children &&
          node.children.length > 0 && (
            <button
              type="button"
              aria-label={node.expanded ? 'Collapse' : 'Expand'}
              className={
                node.expanded ? styles.collapseButton : styles.expandButton
              }
              style={{
                left: (lowerSiblingCounts.length - 0.7) * scaffoldBlockPxWidth,
              }}
              onClick={() =>
                toggleChildrenVisibility({
                  node,
                  path,
                  treeIndex,
                })
              }
            />
          )}

        <div
          className={
            styles.rowWrapper +
            (!canDrag ? ` ${styles.rowWrapperDragDisabled}` : '')
          }
          onClick={node.openFile}
        >
          {/* Set the row preview to be used during drag and drop */}
          {connectDragPreview(
            <div style={{ display: 'flex' }}>
              {scaffold}
              <div
                className={
                  styles.row +
                  (isLandingPadActive ? ` ${styles.rowLandingPad}` : '') +
                  (isLandingPadActive && !canDrop
                    ? ` ${styles.rowCancelPad}`
                    : '') +
                  (isSearchMatch ? ` ${styles.rowSearchMatch}` : '') +
                  (isSearchFocus ? ` ${styles.rowSearchFocus}` : '') +
                  (className ? ` ${className}` : '')
                }
                style={{
                  opacity: isDraggedDescendant ? 0.5 : 1,
                  ...style,
                }}
                >
                <div
                  className={
                    styles.rowContents +
                    (!canDrag ? ` ${styles.rowContentsDragDisabled}` : '')
                  }
                >
                  <div className={styles.rowToolbar}>
                    {icons.map((icon, index) => (
                      <div
                        key={index} // eslint-disable-line react/no-array-index-key
                        className={styles.toolbarButton}
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                  <div className={styles.rowLabel}>
                    <span className={styles.rowTitle} title={nodeTitle}>
                      {typeof nodeTitle === 'function'
                        ? nodeTitle({
                            node,
                            path,
                            treeIndex,
                          })
                          : ReactHtmlParser(nodeTitle)}
                    </span>
                  </div>

                  <div className={styles.rowToolbar}>
                    {buttons.map((btn, index) => (
                      <div
                        key={index} // eslint-disable-line react/no-array-index-key
                        className={styles.toolbarButton}
                      >
                        {btn}
            {!node.children && (
            <ul style={{
              display: 'contents',
                  listStyle: 'none',
            }}>
              <li>
                <a style={{
                  // white >>>   data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='3 3 16 16'%3E%3Cpath fill='%23e8e8e8' d='M12.597 11.042l2.803 2.803-1.556 1.555-2.802-2.802L8.239 15.4l-1.556-1.555 2.802-2.803-2.802-2.803 1.555-1.556 2.804 2.803 2.803-2.803L15.4 8.239z'/%3E%3C/svg%3E
                  // black >>>   data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='3 3 16 16'%3E%3Cpath fill='%23424242' d='M12.597 11.042l2.803 2.803-1.556 1.555-2.802-2.802L8.239 15.4l-1.556-1.555 2.802-2.803-2.802-2.803 1.555-1.556 2.804 2.803 2.803-2.803L15.4 8.239z'/%3E%3C/svg%3E
                  background: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cg fill='%23424242'%3E%3Cpath d='M11 3V1h-1v6h4V3h-3zm2 3h-2V4h2v2zM2 15h7V9H2v6zm2-5h3v1H5v2h2v1H4v-4z'/%3E%3C/g%3E%3Cpath fill='%2300539C' d='M3.979 3.5L4 6 3 5v1.5L4.5 8 6 6.5V5L5 6l-.021-2.5c0-.275.225-.5.5-.5H9V2H5.479c-.828 0-1.5.673-1.5 1.5z'/%3E%3C/svg%3E") 50% no-repeat`,
                  display: 'none',
                  marginRight: '.2em',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
                title={'Replace'}
                  onClick={() => console.log('click replace field')}></a>
              </li>
              <li>
                <a style={{
                  // white >>>   fill='%23e8e8e8'
                  // black >>>   fill='%23424242'
                  background: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='3 3 16 16'%3E%3Cpath fill='%23424242' d='M12.597 11.042l2.803 2.803-1.556 1.555-2.802-2.802L8.239 15.4l-1.556-1.555 2.802-2.803-2.802-2.803 1.555-1.556 2.804 2.803 2.803-2.803L15.4 8.239z'/%3E%3C/svg%3E") 50% no-repeat`,
                  display: 'none',
                  marginRight: '.2em',
                  marginTop: '4px',
                  marginLeft: '4px',
                  width: '8px',
                  height: '8px',
                  cursor: 'pointer',
                  }}
                  onClick={node.removeField}></a>
              </li>
            </ul>
            )}
                      </div>
                    ))}
                  </div>
            {toggleChildrenVisibility &&
            node.children &&
            node.children.length > 0 && (
            <ul style={{
                display: 'contents',
                listStyle: 'none',
            }}>
              <li style={{
                color: 'rgb(255, 255, 255)',
                backgroundColor: 'rgb(77, 77, 77)',
                textAlign: 'center',
                display: 'inline-block',
                padding: '.3em .5em',
                borderRadius: '1em',
                fontSize: '85%',
                minWidth: '1.6em',
                lineHeight: '1em',
                fontWeight: '400',
                boxSizing: 'border-box',
                marginRight: '12px',
              }}>
                {node.children.length}
              </li>
              <li>
                <a style={{
                  // white >>>   fill='%23e8e8e8'
                  // black >>>   fill='%23424242'
                   background: `url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='16px' height='16px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml:space='preserve'%3E %3Cg id='icon_x5F_bg'%3E %3Cpath fill='%23424242' d='M11,15V9H1v6H11z M2,14v-2h1v-1H2v-1h3v4H2z M10,11H8v2h2v1H7v-4h3V11z M3,13v-1h1v1H3z M13,7v6h-1V8H5V7 H13z M13,2V1h-1v5h3V2H13z M14,5h-1V3h1V5z M11,2v4H8V4h1v1h1V4H9V3H8V2H11z'/%3E %3C/g%3E %3Cg id='color_x5F_action'%3E %3Cpath fill='%2300539C' d='M1.979,3.5L2,6L1,5v1.5L2.5,8L4,6.5V5L3,6L2.979,3.5c0-0.275,0.225-0.5,0.5-0.5H7V2H3.479 C2.651,2,1.979,2.673,1.979,3.5z'/%3E %3C/g%3E %3C/svg%3E") 50% no-repeat`,
                   display: 'none',
                   marginRight: '.2em',
                   width: '16px',
                   height: '16px',
                   cursor: 'pointer',
                }}
                title={'Replace All'}
                onClick={() => console.log('click replace all file')}></a>
              </li>
                <li>
                  <a style={{
                  // white >>>   fill='%23e8e8e8'
                  // black >>>   fill='%23424242'
                    background: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='3 3 16 16'%3E%3Cpath fill='%23424242' d='M12.597 11.042l2.803 2.803-1.556 1.555-2.802-2.802L8.239 15.4l-1.556-1.555 2.802-2.803-2.802-2.803 1.555-1.556 2.804 2.803 2.803-2.803L15.4 8.239z'/%3E%3C/svg%3E") 50% no-repeat`,
                    display: 'none',
                    marginRight: '.2em',
                    marginTop: '4px',
                    marginLeft: '4px',
                    width: '8px',
                    height: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={node.removeFile}></a>
                </li>
            </ul>
            )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return canDrag
      ? connectDragSource(nodeContent, { dropEffect: 'copy' })
      : nodeContent;
  }
}

FileThemeNodeContentRenderer.defaultProps = {
  buttons: [],
  canDrag: false,
  canDrop: false,
  className: '',
  draggedNode: null,
  icons: [],
  isSearchFocus: false,
  isSearchMatch: false,
  parentNode: null,
  style: {},
  swapDepth: null,
  swapFrom: null,
  swapLength: null,
  title: null,
  toggleChildrenVisibility: null,
};

FileThemeNodeContentRenderer.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.node),
  canDrag: PropTypes.bool,
  className: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isSearchFocus: PropTypes.bool,
  isSearchMatch: PropTypes.bool,
  listIndex: PropTypes.number.isRequired,
  lowerSiblingCounts: PropTypes.arrayOf(PropTypes.number).isRequired,
  node: PropTypes.shape({}).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  style: PropTypes.shape({}),
  swapDepth: PropTypes.number,
  swapFrom: PropTypes.number,
  swapLength: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  toggleChildrenVisibility: PropTypes.func,
  treeIndex: PropTypes.number.isRequired,
  treeId: PropTypes.string.isRequired,
  rowDirection: PropTypes.string.isRequired,

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  isDragging: PropTypes.bool.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  // Drop target
  canDrop: PropTypes.bool,
  isOver: PropTypes.bool.isRequired,
};

export default FileThemeNodeContentRenderer;
