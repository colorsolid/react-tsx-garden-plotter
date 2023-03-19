import './App.css';
import React from 'react';
import {Toolbar} from './components/Toolbar';
import {Grid} from './components/Grid';
import {SquareObject, plantTypes} from './Global';

import {isMobile} from 'detect-touch-device';

const WIDTH: number = 70;
const HEIGHT: number = 70;

interface AppProps {
}

interface AppState {
    gridHistory?: SquareObject[][][],
    currentGridIndex?: number,
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
            JSON.parse(window.localStorage.getItem('state') || 'null') ||
            {
                gridHistory: [
                    Array(WIDTH)
                        .fill(Array(HEIGHT)
                            .fill({type: 'nothing', border: []}))],
                currentGridIndex: 0,
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
        const gridCopy: SquareObject[][] = copyGrid(this.state.gridHistory![this.state.currentGridIndex!], true);
        const square: SquareObject = gridCopy[rowIndex][squareIndex];

        if (this.state.selectedMode === 'inspect') {
            // do nothing

            // if this is the second click in a selection
        } else if (this.state.selectionStart) {
            const currentGridIndex: number = this.state.currentGridIndex!;
            if (this.state.gridHistory!.length > currentGridIndex + 1) {
                this.setState({gridHistory: this.state.gridHistory!.slice(0, currentGridIndex + 1)}, () => {
                    this.fillSquares(rowIndex, squareIndex, gridCopy);
                });
            } else {
                this.fillSquares(rowIndex, squareIndex, gridCopy);
            }
            // first click to start a selection
        } else if (['add-plant-area', 'remove-plant-area'].includes(this.state.selectedMode!) || square.plantArea) {
            this.setState({
                // gridHistory: this.replaceGrid(this.state.currentGridIndex!, gridCopy),
                selectionStart: [rowIndex, squareIndex]
            });
        }
    }

    handleMouseOver(rowIndex: number, squareIndex: number) {
        if (this.state.selectionStart) {
            const gridCopy: SquareObject[][] = copyGrid(this.state.gridHistory![this.state.currentGridIndex!], true);
            this.fillSquares(rowIndex, squareIndex, gridCopy, true);
        }
        this.updateToolbarInfo(rowIndex, squareIndex);
    }

    historyBack() {
        const currentGridIndex = this.state.currentGridIndex! - (this.state.currentGridIndex! > 0 ? 1 : 0);
        this.setState({currentGridIndex: currentGridIndex}, () => {
            this.drawCompatibility();
        });
    }

    historyForward() {
        const currentGridIndex = this.state.currentGridIndex! + (this.state.currentGridIndex! < this.state.gridHistory!.length - 1 ? 1 : 0);
        this.setState({currentGridIndex: currentGridIndex}, () => {
            this.drawCompatibility();
        });
    }

    changeModeAndType(type: string, mode: string) {
        this.setState({
            selectedType: type,
            selectedMode: mode
        }, () => {
            this.drawCompatibility()
        });
    }

    cancelSelection() {
        this.setState({selectionStart: null});
        [].slice.call(document.querySelectorAll('.highlight'))
            .map((e: HTMLElement) => e.classList.remove('highlight'));
    }

    updateToolbarInfo(rowIndex: number, squareIndex: number) {
        this.setState({
            hoverCoordinates: [rowIndex, squareIndex],
            hoverType: this.state.gridHistory![this.state.currentGridIndex!][rowIndex][squareIndex].type
        })
    }

    appendGridToHistory(
        gridCopy: SquareObject[][],
        gridHistory: SquareObject[][][] = this.state.gridHistory!): SquareObject[][][] {
        const history = gridHistory.concat([gridCopy]);
        if (history.length > 10) {
            const amount_over = history.length - 10;
            history.splice(0, amount_over);
        } else {
            this.setState({currentGridIndex: history.length - 1});
        }
        return history;
    }

    replaceGrid(
        index: number,
        grid: SquareObject[][],
        gridHistory: SquareObject[][][] = this.state.gridHistory!
    ): SquareObject[][][] {
        const gridHistoryCopy = gridHistory.slice(0);
        gridHistoryCopy[index] = grid;
        return gridHistoryCopy;
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

        const [selectionStartRow, selectionStartSquare] = this.state.selectionStart!;
        const startType = gridCopy[selectionStartRow][selectionStartSquare]!.type;

        // fill the squares within the selection range
        for (let _rowIndex: number = topRow; _rowIndex <= bottomRow; _rowIndex++) {
            for (let _squareIndex: number = topSquare; _squareIndex <= bottomSquare; _squareIndex++) {
                const square: SquareObject = gridCopy[_rowIndex][_squareIndex];
                square.highlight = false;

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
                } else if (
                    (square.plantArea && (square.type === 'nothing' || square.type === startType))
                    || this.state.selectedType === 'nothing') {
                    square.type = this.state.selectedType!;
                }
            }
        }

        if (highlight) {
            this.setState({
                gridHistory: this.replaceGrid(this.state.currentGridIndex!, gridCopy),
            });
        } else {

            // const gridHistory = this.replaceGrid(this.state.currentGridIndex!, gridCopy);

            this.setState({
                gridHistory: this.appendGridToHistory(gridCopy),
                selectionStart: null,
            }, () => {
                this.drawCompatibility();
            });
        }
    }

    drawCompatibility(gridCopy: SquareObject[][] | null = null) {
        let gridHistory = this.state.gridHistory!;

        if (gridCopy === null) {
            gridCopy = copyGrid(this.state.gridHistory![this.state.currentGridIndex!]);
        }

        // loop through all squares in the grid and assign compatibility based on the offset squares types
        for (let _rowIndex: number = 0; _rowIndex < HEIGHT; _rowIndex++) {
            for (let _squareIndex: number = 0; _squareIndex < WIDTH; _squareIndex++) {
                const square = gridCopy[_rowIndex][_squareIndex];
                square.compatibility = null;
                square.highlight = false;
                square.border = [];
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
                                if (offsetSquare.type !== square.type) {
                                    if (rowOffset === -1 && squareOffset === 0) {
                                        square.border.push('bt');
                                    }
                                    else if (rowOffset === 1 && squareOffset === 0) {
                                        square.border.push('bb');
                                    }
                                    else if (rowOffset === 0 && squareOffset === -1) {
                                        square.border.push('bl');
                                    }
                                    else if (rowOffset === 0 && squareOffset === 1) {
                                        square.border.push('br');
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
                                // else if (this.state.selectedType !== 'nothing'
                                //     && square.compatibility === null
                                //     && offsetSquare.type !== 'nothing') {
                                //     square.compatibility = 0;
                                // }
                            }
                            if (this.state.selectedType !== 'nothing'
                                && square.compatibility === null
                                && offsetSquare.type !== 'nothing'
                                && offsetSquare.type !== square.type) {
                                square.compatibility = 0;
                            }
                        }
                    }
                }
            }
        }

        gridHistory = this.replaceGrid(this.state.currentGridIndex!, gridCopy, gridHistory);
        this.setState({gridHistory: gridHistory});
    }

    clearSquares() {
        const confirmation: boolean = window.confirm('Clear everything?')
        if (!confirmation) {
            return;
        }
        const grid: SquareObject[][] = Array(WIDTH)
            .fill(Array(HEIGHT)
                .fill({type: 'nothing'}));
        this.setState({
            gridHistory: this.appendGridToHistory(grid),
            selectionStart: null,
            selectedMode: 'add-plant-area'
        });
    }

    _import() {
        //const fileData = JSON.parse(event.target.result);

    }

    _export() {
        const jsonString = JSON.stringify(this.state);
        const button = document.createElement('a');
        button.setAttribute('href', 'data:text/plan;charset=utf-8,' + encodeURIComponent(jsonString))
        button.setAttribute('download', 'plotter-data.json')
        button.style.display = 'none';
        document.body.appendChild(button);
        button.click();
        document.body.removeChild(button);
    }

    loadFileData(event: any) {
        let fileData = JSON.parse(event.target!.result);
        if (fileData.length === 0) return;
        try {
            this.setState(fileData);
        }
        catch (e) {
            alert('Error importing data');
        }
    }

    componentDidMount() {
        const toolbar = document.getElementById('toolbar');
        const container = document.getElementById('outer-container');

        const fixHeight = () => {
            container!.style.height = `${window.innerHeight - toolbar!.offsetHeight}px`;
        }

        const fileInput = document.getElementById('file-upload')!;

        fileInput.onchange = () => {
            const reader = new FileReader()
            reader.onload = (event) => {this.loadFileData(event)};
            reader.readAsText((fileInput as HTMLInputElement).files![0])
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
                    undo={{call: this.historyBack.bind(this), enabled: this.state.currentGridIndex! > 0}}
                    redo={{
                        call: this.historyForward.bind(this),
                        enabled: this.state.currentGridIndex! < this.state.gridHistory!.length - 1
                    }}
                    _import={{call: this._import.bind(this), enabled: true}}
                    _export={{call: this._export.bind(this), enabled: this.state.currentGridIndex! > 0}}
                />
                <Grid
                    grid={this.state.gridHistory![this.state.currentGridIndex!]}
                    onClick={this.handleClick.bind(this)}
                    onMouseOver={this.handleMouseOver.bind(this)}
                />
            </React.Fragment>
        );
    }
}

export default App;
