import './App.css';
import React from 'react';
import {Toolbar} from './components/Toolbar';
import {Grid} from './components/Grid';
import {SquareObject, plantTypes} from './Global';

import { isMobile } from 'detect-touch-device';

console.log(isMobile)

const WIDTH: number = 70;
const HEIGHT: number = 70;

interface AppProps {
}

interface AppState {
    grid?: SquareObject[][],
    groups?: SquareObject[][],
    selectionStart?: number[] | null,
    selectedMode?: string,
    selectedType?: string,
    groupIndex?: number,
    hoverCoordinates?: number[] | null,
    hoverType?: string
}

function copyGrid(grid: SquareObject[][], removeHighlight: boolean = false): SquareObject[][] {
    const gridCopy: SquareObject[][] = [];
    for (let rowsIndex: number = 0; rowsIndex < HEIGHT; rowsIndex++) {
        gridCopy.push([]);
        for (let squaresIndex: number = 0; squaresIndex < WIDTH; squaresIndex++) {
            const square = {...grid[rowsIndex][squaresIndex]};
            if (removeHighlight) {
                square.highlight = false;
            }
            gridCopy[rowsIndex].push(square);
        }
    }
    return gridCopy;
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: object) {
        super(props);
        this.state =
            // JSON.parse(window.localStorage.getItem('state') || 'null') ||
            {
                grid: Array(WIDTH)
                    .fill(Array(HEIGHT)
                        .fill({type: 'nothing', state: ''})),
                selectionStart: null,
                selectedMode: 'add-plant-area',
            }
    }

    setState(state: AppState, callback: () => any = () => {
    }) {
        super.setState(state, () => {
            window.localStorage.setItem('state', JSON.stringify(this.state));
            callback();
        });
    }

    handleClick(rowIndex: number, squareIndex: number) {
        const gridCopy: SquareObject[][] = copyGrid(this.state.grid!, true);
        const square: SquareObject = gridCopy[rowIndex][squareIndex];
        let gridHistory = this.state.grid!;

        if (this.state.selectedMode === 'inspect') {

        } else if (this.state.selectionStart) {
            this.fillSquares(rowIndex, squareIndex, gridCopy);
            this.drawCompatibility(gridCopy);
        } else if (['add-plant-area', 'remove-plant-area'].includes(this.state.selectedMode!) || square.plantArea) {
            this.setState({
                grid: gridCopy,
                selectionStart: [rowIndex, squareIndex]
            });
        }
    }

    handleMouseOver(rowIndex: number, squareIndex: number) {
        if (this.state.selectionStart) {
            const gridCopy: SquareObject[][] = copyGrid(this.state.grid!, true);
            this.fillSquares(rowIndex, squareIndex, gridCopy, true);
        }
        this.updateToolbarInfo(rowIndex, squareIndex);
    }

    updateToolbarInfo(rowIndex: number, squareIndex: number) {
        this.setState({
            hoverCoordinates: [rowIndex, squareIndex],
            hoverType: this.state.grid![rowIndex][squareIndex].type
        })
    }

    getStartAndEndRows(rowIndex: number, squareIndex: number) {
        const [rowA, squareA]: number[] = this.state.selectionStart!;

        // find top and bottom rows
        let topRow: number = rowA;
        let bottomRow: number = rowIndex;
        if (topRow > rowIndex) {
            topRow = rowIndex;
            bottomRow = rowA;
        }
        // find start and end squares
        let topSquare: number = squareA;
        let bottomSquare: number = squareIndex;
        if (topSquare > squareIndex) {
            topSquare = squareIndex;
            bottomSquare = squareA;
        }
        return [topRow, bottomRow, topSquare, bottomSquare];
    }

    fillSquares(rowIndex: number, squareIndex: number, gridCopy: SquareObject[][], highlight: boolean = false) {
        const [topRow, bottomRow, topSquare, bottomSquare] = this.getStartAndEndRows(rowIndex, squareIndex)

        // fill the squares within the selection range
        for (let _rowIndex: number = topRow; _rowIndex <= bottomRow; _rowIndex++) {
            for (let _squareIndex: number = topSquare; _squareIndex <= bottomSquare; _squareIndex++) {
                const square: SquareObject = gridCopy[_rowIndex][_squareIndex];
                square.highlight = false;

                const squareCopy = {...square};
                squareCopy.coordinates = [_rowIndex, _squareIndex];

                // highlight when selecting end point
                if (highlight) {
                    square.highlight = true;
                    // fill squares with plant area
                } else if (this.state.selectedMode === 'add-plant-area') {
                    square.plantArea = true;
                    // remove plant area
                } else if (this.state.selectedMode === 'remove-plant-area') {
                    square.plantArea = false;
                    square.type = 'nothing';
                    // fill squares with plant if in plant area
                } else if ((square.plantArea && square.type === 'nothing') || this.state.selectedType === 'nothing') {
                    square.type = this.state.selectedType!;
                }
            }
        }

        // if (groupType !== null) {
        //     this.calculateGroups(group);
        // }

        const selectionStart = this.state.selectionStart;
        if (highlight) {
            this.setState({
                grid: gridCopy,
            });
        } else {
            gridCopy[selectionStart![0]][selectionStart![1]].compatibility = null;
            this.setState({
                grid: gridCopy,
                selectionStart: null,
            });
        }
    }

    changeModeAndType(type: string, mode: string) {
        this.setState({
            selectedType: type,
            selectedMode: mode
        }, () => {
            this.drawCompatibility()
        });
    }

    drawCompatibility(gridCopy: SquareObject[][] | null = null) {
        if (gridCopy === null) {
            gridCopy = copyGrid(this.state.grid!);
        }

        // loop through all squares in the grid and assign compatibility based on the offset squares types
        for (let _rowIndex: number = 0; _rowIndex < HEIGHT; _rowIndex++) {
            for (let _squareIndex: number = 0; _squareIndex < WIDTH; _squareIndex++) {
                const square = gridCopy[_rowIndex][_squareIndex];
                square.compatibility = null;
                if (square.plantArea) {
                    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
                        const rowOffsetIndex = _rowIndex + rowOffset;
                        // make sure offset row is within grid boundaries
                        if (rowOffsetIndex < 0 || rowOffsetIndex >= HEIGHT) {
                            continue;
                        }
                        for (let squareOffset = -1; squareOffset <= 1; squareOffset++) {
                            const squareOffsetIndex = _squareIndex + squareOffset;
                            // make sure offset square is within grid boundaries
                            if (squareOffsetIndex < 0 || squareOffsetIndex >= WIDTH) {
                                continue;
                            }

                            const offsetSquare = gridCopy[rowOffsetIndex][squareOffsetIndex];

                            // if square has a plant
                            if (square.type !== 'nothing') {
                                const squareCompatibilityList = plantTypes[square.type];
                                if (squareCompatibilityList.hasOwnProperty(offsetSquare.type)) {
                                    // if square has a compatibility entry for the offset square's type
                                    const compatibility = squareCompatibilityList[offsetSquare.type];
                                    if (square.compatibility === null || square.compatibility === 0 || compatibility < 0) {
                                        square.compatibility = compatibility;
                                    }
                                }
                            }

                            // if square is empty
                            if (square.type === 'nothing') {
                                const squareCompatibilityList = plantTypes[offsetSquare.type];
                                // if offset square has a compatibility entry for the selected type
                                if (squareCompatibilityList.hasOwnProperty(this.state.selectedType!)) {
                                    const compatibility = squareCompatibilityList[this.state.selectedType!];
                                    if (square.compatibility === null || square.compatibility === 0 || compatibility < 0) {
                                        square.compatibility = compatibility;
                                    }
                                }
                                // square is neutral
                                else if (this.state.selectedType !== 'nothing'
                                    && square.compatibility === null
                                    && offsetSquare.type !== 'nothing') {
                                    square.compatibility = 0;
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({grid: gridCopy});
    }

    clearSquares() {
        const confirmation: boolean = window.confirm('Clear everything?')
        if (!confirmation) {
            return;
        }
        const grid: SquareObject[][] = this.state.grid!
            .map(row => row.map((square: SquareObject) => {
                    return {
                        type: 'nothing',
                        compatibility: null,
                        highlight: false,
                        plantArea: false
                    };
                })
            );
        this.setState({
            grid: grid,
            selectionStart: null,
            selectedMode: 'add-plant-area'
        });
    }

    cancelSelection() {
        this.setState({selectionStart: null});
        [].slice.call(document.querySelectorAll('.highlight'))
            .map((e: HTMLElement) => e.classList.remove('highlight'));
    }

    componentDidMount() {
        const toolbar = document.getElementById('toolbar');
        const container = document.getElementById('outer-container');

        const fixHeight = () => {
            container!.style.height = `${window.innerHeight - toolbar!.offsetHeight}px`;
        }
        fixHeight();

        window.onresize = event => {
            fixHeight();
        };
    }


    render() {
        return (
            <React.Fragment>
                <Toolbar
                    selectedType={this.state.selectedType!}
                    selectedMode={this.state.selectedMode!}
                    hoverCoordinates={this.state.hoverCoordinates!}
                    hoverType={this.state.hoverType!}
                    changeModeAndType={this.changeModeAndType.bind(this)}
                    clearSquares={this.clearSquares.bind(this)}
                    selectionStarted={!!this.state.selectionStart}
                    cancelSelection={this.cancelSelection.bind(this)}
                    isMobile={isMobile}
                />
                <Grid
                    grid={this.state.grid!}
                    onClick={this.handleClick.bind(this)}
                    onMouseOver={this.handleMouseOver.bind(this)}
                />
            </React.Fragment>
        );
    }
}

export default App;
