import React, { Component } from 'react';
import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import FileExplorerTheme from '../index';
import './app.css';



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      replace: '',
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
      treeData: [
        { title: '<div>.gitignore</div>', annotation: "text.rtf"},
        { title: 'package.json', annotation: "text.rtf",  },
        {
          title: 'src',
          isDirectory: true,
          expanded: true,
          children: [
            { title: 'styles.css', callback: () => {console.log('hello word')} },
            { title: 'index.js', annotation: "/asdzxcasdfzxc.rtf" },
            { title: 'reducers.js', annotation: "dddddsssaaaaax/5.rtf" },
            { title: 'actions.js', annotation: "222333dd6.rtf" },
            { title: 'utils.js' },
          ],
          annotation: "/1.rtf",
          query: '',
        },
        {
          title: 'tmp',
          isDirectory: true,
          children: [
            { title: '12214124-log' },
            { title: 'drag-disabled-file', dragDisabled: true },
          ],
          annotation: "/1.rtf"
        },
        {
          title: 'build',
          isDirectory: true,
          children: [{ title: 'react-sortable-tree.js' }],
          annotation: "/112.rtf"
        },
        {
          title: 'public',
          isDirectory: true,
        },
        {
          title: 'node_modules',
          isDirectory: true,
        },
      ],
    };

    this.updateTreeData = this.updateTreeData.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
  }

  updateTreeData(treeData) {
    this.setState({ treeData });
  }

  expand(expanded) {
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    });
  }

  expandAll() {
    this.expand(true);
  }

  collapseAll() {
    this.expand(false);
  }

  render() {
    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
      replace,
    } = this.state;

    const alertNodeInfo = ({ node, path, treeIndex }) => {
      const objectString = Object.keys(node)
        .map(k => (k === 'children' ? 'children: Array' : `${k}: '${node[k]}'`))
        .join(',\n   ');

      global.alert(
        'Info passed to the icon and button generators:\n\n' +
          `node: {\n   ${objectString}\n},\n` +
          `path: [${path.join(', ')}],\n` +
          `treeIndex: ${treeIndex}`
      );
    };

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      });

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      });


    // const formatAnnotation = (query, forReplace, data) => {
    //   if(data && data.search(query) !== -1) {
    //     const result = data.replace(query, `<span style="text-decoration: line-through; background-color: red;">${query}</span><mark>${forReplace}</mark>`);
    //     return result
    //   }
    //   return data
    // }



    // const data = this.state.treeData;
    // for (let i = 0; i < data.length; i++) {
    //   if(data[i].annotation) {
    //     formatAnnotation(searchString, replace, data[i].annotation)
    //   }
    // }

    const newTree = treeData.map(el => {
      const result = el;
      if(el.children) {
        result.children = el.children.map(ch => ({...ch, search: searchString, replace}))
      }
      return  {...result, search: searchString, replace};
    })
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
      >
        <div style={{ flex: '0 0 auto', padding: '0 15px' }}>
          <h3>File Explorer Theme</h3>
          <button onClick={this.expandAll}>Expand All</button>
          <button onClick={this.collapseAll}>Collapse All</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <form
            style={{ display: 'inline-block' }}
            onSubmit={event => {
              event.preventDefault();
            }}
          >
            <label htmlFor="find-box">
              Search:&nbsp;
              <input
                id="find-box"
                type="text"
                value={searchString}
                onChange={event =>
                  this.setState({ searchString: event.target.value })
                }
              />
            </label>

            <label htmlFor="replace">
              Replace:&nbsp;
              <input
                  id="replace"
                  type="text"
                  value={replace}
                  onChange={event => this.setState({ replace: event.target.value })
                  }
              />
            </label>

            <button
              type="button"
              disabled={!searchFoundCount}
              onClick={selectPrevMatch}
            >
              &lt;
            </button>

            <button
              type="submit"
              disabled={!searchFoundCount}
              onClick={selectNextMatch}
            >
              &gt;
            </button>

            <span>
              &nbsp;
              {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;/&nbsp;
              {searchFoundCount || 0}
            </span>
          </form>
        </div>
        <div style={{ flex: '1 0 50%', padding: '0 0 0 15px' }}>
          <SortableTree
            theme={FileExplorerTheme}
            treeData={newTree}
            onChange={this.updateTreeData}
            searchFocusOffset={searchFocusIndex}
            searchFinishCallback={matches =>
              this.setState({
                searchFoundCount: matches.length,
                searchFocusIndex:
                  matches.length > 0 ? searchFocusIndex % matches.length : 0,
              })
            }
            canDrag={({ node }) => !node.dragDisabled}
            canDrop={({ nextParent }) => !nextParent || nextParent.isDirectory}
            generateNodeProps={rowInfo =>
            //     ({
            //   icons: rowInfo.node.isDirectory
            //     ? [
            //         <div
            //           style={{
            //             borderLeft: 'solid 8px gray',
            //             borderBottom: 'solid 10px gray',
            //             marginRight: 10,
            //             boxSizing: 'border-box',
            //             width: 16,
            //             height: 12,
            //             filter: rowInfo.node.expanded
            //               ? 'drop-shadow(1px 0 0 gray) drop-shadow(0 1px 0 gray) drop-shadow(0 -1px 0 gray) drop-shadow(-1px 0 0 gray)'
            //               : 'none',
            //             borderColor: rowInfo.node.expanded ? 'white' : 'gray',
            //           }}
            //         />,
            //       ]
            //     : [
            //         <div
            //           style={{
            //             border: 'solid 1px black',
            //             fontSize: 8,
            //             textAlign: 'center',
            //             marginRight: 10,
            //             width: 12,
            //             height: 16,
            //           }}
            //         >
            //           F
            //         </div>,
            //       ],
            //   buttons: [
            //     <button
            //       style={{
            //         padding: 0,
            //         borderRadius: '100%',
            //         backgroundColor: 'gray',
            //         color: 'white',
            //         width: 16,
            //         height: 16,
            //         border: 0,
            //         fontWeight: 100,
            //       }}
            //       onClick={() => alertNodeInfo(rowInfo)}
            //     >
            //       i
            //     </button>,
            //   ],
            // })
            {
              return {
                buttons: [
                  <div
                    key={1}
                    style={{
                      fontSize: '10px',
                      opacity: 0.5,
                      marginRight: '10px'
                    }}
                  >
                    {ReactHtmlParser(rowInfo.node.title)}
                  </div>,
                ],
              }
            }
            }
          />
        </div>
      </div>
    );
  }
}

export default App;
