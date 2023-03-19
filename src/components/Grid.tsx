import {SquareObject} from '../Global';
import React from 'react';
import {Square} from './Square';

interface GridProps {
    grid: SquareObject[][],
    onClick: (rowIndex: number, squareIndex: number) => void,
    onMouseOver: (rowIndex: number, squareIndex: number) => void;
}

export function Grid({grid, onClick, onMouseOver}:GridProps) {
    return (
        <div id={'outer-container'}>
            <div id={'inner-container'}>
                {grid.map((row: SquareObject[], rowIndex: number) =>
                    <div key={'row_' + rowIndex.toString()} className={'row-custom'}>
                        {
                            row.map((square: SquareObject, squareIndex: number) =>
                                <Square
                                    key={(rowIndex * grid[0].length + squareIndex).toString()}
                                    onClick={onClick}
                                    onMouseOver={onMouseOver}
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