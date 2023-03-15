import {SquareObject} from '../Global';
import React from 'react';
import {Square} from './Square';

interface GridProps {
    grid: SquareObject[][],
    onClick: (rowIndex: number, squareIndex: number) => void,
    onMouseOver: (rowIndex: number, squareIndex: number) => void;
}

export class Grid extends React.Component<GridProps> {
    render() {
        console.log(this.props.grid);
        return (
            <div id={'outer-container'} onLoad={() => console.log('test')}>
                <div id={'inner-container'}>
                    {this.props.grid.map((row: SquareObject[], rowIndex: number) =>
                        <div key={'row_' + rowIndex.toString()} className={'row-custom'}>
                            {
                                row.map((square: SquareObject, squareIndex: number) =>
                                    <Square
                                        key={(rowIndex * this.props.grid[0].length + squareIndex).toString()}
                                        onClick={this.props.onClick}
                                        onMouseOver={this.props.onMouseOver}
                                        rowIndex={rowIndex}
                                        squareIndex={squareIndex}
                                        square={square}
                                    />
                                )
                            }
                        </div>
                    )}
                </div>
            </div>
        );
    }
}