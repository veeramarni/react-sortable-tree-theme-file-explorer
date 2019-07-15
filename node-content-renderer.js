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

    // const setActive = (node) => {
    //   console.log(node, 'event???');
    //   // node.openFile();
    //   const field = document.getElementsByClassName('rowWrapperDragDisabled');
    //   console.log(field, 'field><><>');
    //   field.classList.add('active')
    // }

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
                  <div className={styles.rowLabel} onClick={() => toggleChildrenVisibility({node, path, treeIndex})}>
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

                  <div className={styles.rowToolbar}
                  onClick={() => toggleChildrenVisibility({node, path, treeIndex})} >
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
                          <a className={styles.replaceField}
                             title={'Replace'}
                             onClick={() => console.log('click replace field')} />
                        </li>
                        <li>
                          <a className={styles.removeFromTreeBtn} onClick={node.removeField} />
                        </li>
                      </ul>
                      )}
                    </div>
                  ))}
                  </div>
                    {toggleChildrenVisibility &&
                    node.children &&
                    node.children.length > 0 && (
                        ////
                      <ul style={{
                          display: 'contents',
                          listStyle: 'none',
                      }}>
                        <li className={styles.counter}>
                          {node.children.length}
                        </li>
                        <li>
                          <a className={styles.replaceFile}
                          title={'Replace All'}
                          onClick={node.replaceAllInFile} />
                        </li>
                          <li>
                            <a className={styles.removeFromTreeBtn} onClick={node.removeFile} />
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
